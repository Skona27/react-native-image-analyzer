import React from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import { Camera as CameraBase, CameraCapturedPicture } from "expo-camera";
import { useMachine } from "@xstate/react";
import { machine, Send } from "./machine";

type Props = { send: Send };

export default function App() {
  const [current, send] = useMachine(machine);

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {(current.matches("ready") || current.matches("init")) && (
          <MainScreen send={send} />
        )}
        {current.matches("camera") && <Camera send={send} />}
        {current.matches("processing") && <Loader />}
      </View>
    </View>
  );
}

function MainScreen({ send }: Props) {
  return (
    <>
      <Text style={styles.heading}>Image Analyzer</Text>

      <Image
        style={styles.image}
        source={{
          uri:
            "https://cdn1.iconfinder.com/data/icons/hawcons/32/698903-icon-22-eye-512.png",
        }}
      />

      <Button
        title="Open camera"
        onPress={() => {
          send({ type: "OPEN_CAMERA" });
        }}
      >
        Open camera
      </Button>
    </>
  );
}

function Camera({ send }: Props) {
  const camera = React.useRef<CameraBase>(null);

  const takeSnap = () => {
    const cb = async () => {
      if (camera.current) {
        const snap = await camera.current.takePictureAsync({
          quality: 0.5,
        });
        send({ type: "SAVE_SNAP", data: snap });
      }
    };
    cb();
  };

  return (
    <>
      <Text style={styles.heading}>What do you want to analyze?</Text>

      <CameraBase type={CameraBase.Constants.Type.back} ref={camera} />
      <View>
        <Button title="Take photo" onPress={takeSnap}>
          Take photo
        </Button>
      </View>
    </>
  );
}

function Loader() {
  return (
    <>
      <Text style={styles.heading}>Your image is beeing analyzed</Text>
      <Text style={styles.heading}>Please wait</Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  wrapper: {
    height: 650,
    display: "flex",
    justifyContent: "space-between",
  },
  heading: {
    fontSize: 30,
  },
  image: {
    height: 200,
    width: 200,
  },
});
