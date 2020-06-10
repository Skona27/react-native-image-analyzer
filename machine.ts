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
            actions: (...args) => console.log(args),
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
      processing: {},
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
    },
    actions: {
      [Options.actions.setSnap]: assign<Context, Event["SAVE_SNAP"]>({
        snap: (_, event) => event.data,
      }) as any,
    },
  }
);
