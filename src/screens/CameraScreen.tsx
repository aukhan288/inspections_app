import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
  type CameraProps,
} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import Reanimated, {
  useAnimatedProps,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import CameraRoll from '@react-native-camera-roll/camera-roll';

Reanimated.addWhitelistedNativeProps({ zoom: true });
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
const { width } = Dimensions.get('screen');

const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'App needs access to save photos to your gallery',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

const CameraScreen = () => {
  const camera = useRef<Camera>(null);
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [torch, setTorch] = useState(false);
  const [now, setNow] = useState(new Date());

  const zoom = useSharedValue(1);
  const zoomOffset = useSharedValue(1);

  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

useEffect(() => {
  // Load last photo from Inspections folder on mount
  const loadLastPhoto = async () => {
    const dirPath = `${RNFS.PicturesDirectoryPath}/Inspections`;
    if (await RNFS.exists(dirPath)) {
      const files = await RNFS.readDir(dirPath);
      if (files.length > 0) {
        // Sort by modification time descending
        const sorted = files.sort((a, b) => b.mtime!.getTime() - a.mtime!.getTime());
        setLastPhoto('file://' + sorted[0].path);
      }
    }
  };
  loadLastPhoto();
}, []);


  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  useEffect(() => {
    if (device) zoom.value = device.neutralZoom ?? 1;
  }, [device]);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => { zoomOffset.value = zoom.value; })
    .onUpdate(event => {
      if (!device) return;
      const z = zoomOffset.value * event.scale;
      zoom.value = interpolate(
        z,
        [1, 10],
        [device.minZoom, device.maxZoom],
        Extrapolation.CLAMP,
      );
    });

  const animatedProps = useAnimatedProps<CameraProps>(() => ({
    zoom: zoom.value,
  }));

  const format = useCameraFormat(device, [
    { photoResolution: 'max' },
    { photoHdr: true },
  ]);

const takePhoto = async () => {
  if (!camera.current) return;

  try {
    // Take photo
    const photo = await camera.current.takePhoto({
      flash: torch ? 'on' : 'off',
    });

    if (!photo?.path) throw new Error('Photo path is undefined');

    // Ensure Inspections folder exists
    const dirPath = `${RNFS.PicturesDirectoryPath}/Inspections`;
    if (!(await RNFS.exists(dirPath))) await RNFS.mkdir(dirPath);

    // Save photo to Inspections folder
    const filePath = `${dirPath}/IMG_${Date.now()}.jpg`;
    await RNFS.copyFile(photo.path, filePath);

    // Scan file so MediaStore picks it up
    if (Platform.OS === 'android') {
      await RNFS.scanFile(filePath);
      console.log('Scanned file:', filePath);
    }

    // Update preview
    setLastPhoto('file://' + filePath);

    Alert.alert('Saved', 'Photo saved and visible in Gallery.');

  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to save photo: ' + error);
  }
};


  if (!device) return <Text style={styles.center}>Loading camera…</Text>;
  if (!hasPermission) return <Text style={styles.center}>No camera permission</Text>;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <ReanimatedCamera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
          format={format}
          enableLocation
          torch={torch ? 'on' : 'off'}
          animatedProps={animatedProps}
        />
      </GestureDetector>

      <View style={{ position: 'absolute', left: 10, top: 10 }}>
        <Text style={{ color: '#fff', fontWeight: '400' }}>
          {now.toLocaleString().toUpperCase()}
        </Text>
      </View>

      <View style={{ position: 'absolute', right: 10, top: 50 }}>
        <Pressable onPress={() => setTorch(t => !t)}>
          <View
            style={{
              width: 18,
              marginLeft: 20,
              height: 60,
              backgroundColor: torch ? '#ffcb7cff' : '#fff0',
            }}
          />
          <Image
            source={
              torch
                ? require('../assets/images/torch-on.png')
                : require('../assets/images/torch-off.png')
            }
            style={{ width: 40, height: 60, marginLeft: 10 }}
          />
        </Pressable>
      </View>

      <View style={styles.bottomRow}>
       <Pressable
  style={[styles.switchBtn, styles.transparent]}
  onPress={async () => {
    if (Platform.OS === 'android') {
      try {
        const dirPath = `${RNFS.PicturesDirectoryPath}/Inspections`;
        const files = await RNFS.readDir(dirPath);

        for (const file of files) {
          if (file.isFile()) {
            await RNFS.scanFile(file.path); // scan individual files
          }
        }

        Alert.alert('Directory scanned', 'Open your Gallery app to see images.');
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to scan directory.');
      }
    }
  }}
>
  {lastPhoto ? (
    <Image source={{ uri: lastPhoto }} style={{ width: 60, height: 60, borderRadius: 8 }} />
  ) : (
    <Icon name="photo-library" size={60} color="#103B38" />
  )}
</Pressable>



        <Pressable style={styles.captureBtn} onPress={takePhoto} />

        <Pressable
          style={[styles.switchBtn, styles.transparent]}
          onPress={() =>
            setCameraPosition(p => (p === 'back' ? 'front' : 'back'))
          }
        >
          <Icon name="cameraswitch" size={60} color="#103B38" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomRow: {
    position: 'absolute',
    bottom: 10,
    width,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  captureBtn: {
    height: 80,
    width: 80,
    backgroundColor: '#103B38',
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#F7B551',
  },
  switchBtn: {
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparent: { backgroundColor: '#fff0' },
});

export default CameraScreen;
