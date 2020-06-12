import { createMachine, assign, Interpreter } from "xstate";
import { Camera, CameraCapturedPicture } from "expo-camera";

type Context = {
  hasPermissions: boolean;
  snap: CameraCapturedPicture | null;
};

type Event = {
  OPEN_CAMERA: { type: "OPEN_CAMERA" };
  SAVE_SNAP: { type: "SAVE_SNAP"; data: CameraCapturedPicture };
};

type ValueOf<T> = T[keyof T];

type Service = Interpreter<Context, any, ValueOf<Event>>;

export type Send = Service["send"];

const Options = {
  services: {
    grantPermissions: "grantPermissions",
    sendSnap: "sendSnap",
  },
  actions: {
    setSnap: "setSnap",
  },
};

export const machine = createMachine<Context, ValueOf<Event>>(
  {
    id: "machine",
    strict: true,
    initial: "init",
    context: {
      hasPermissions: false,
      snap: null,
    },
    states: {
      init: {
        invoke: {
          src: Options.services.grantPermissions,
          onDone: {
            actions: assign<Context>({
              hasPermissions: () => true,
            }),
            target: "ready",
          },
          onError: {
            target: "error",
          },
        },
      },
      ready: {
        on: {
          OPEN_CAMERA: {
            target: "camera",
          },
        },
      },
      camera: {
        on: {
          SAVE_SNAP: {
            target: "processing",
            actions: Options.actions.setSnap,
          },
        },
      },
      processing: {
        invoke: {
          src: Options.services.sendSnap,
          onDone: {
            target: "result",
          },
          onError: {
            target: "error",
          },
        },
      },
      result: {},
      error: {},
    },
  },
  {
    services: {
      [Options.services.grantPermissions]: async () => {
        const { status } = await Camera.requestPermissionsAsync();
        return status === "granted";
      },
      [Options.services.sendSnap]: async (context: Context) => {
        const data = await fetch("http://192.168.1.100:3001/image", {
          method: "POST",
          headers: { "content-type": "application/json; charset=utf-8" },
          body: JSON.stringify({ image: context.snap?.base64 || "" }),
        });
        return data;
      },
    },
    actions: {
      [Options.actions.setSnap]: assign<Context, Event["SAVE_SNAP"]>({
        snap: (_, event) => event.data,
      }) as any,
    },
  }
);
