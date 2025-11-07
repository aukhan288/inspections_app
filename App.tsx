// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  CameraDevice,
  CameraPermissionRequestResult,
  CameraPermissionStatus,
} from 'react-native-vision-camera';

type PermissionState = CameraPermissionStatus | CameraPermissionRequestResult | null;
type FlashMode = 'off' | 'on' | 'auto';

const App: React.FC = () => {
  // typed camera ref for Vision Camera component instance
  const camera = useRef<React.ElementRef<typeof Camera> | null>(null);

  // device selection
  const [devicePosition, setDevicePosition] = useState<'front' | 'back'>('back');
  const device = useCameraDevice(devicePosition);

  // permissions
  const [cameraPermission, setCameraPermission] = useState<PermissionState>(null);
  const [microphonePermission, setMicrophonePermission] = useState<PermissionState>(null);

  // UI / camera state
  const [isActive, setIsActive] = useState<boolean>(true);
  const [flash, setFlash] = useState<FlashMode>('off');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [formats, setFormats] = useState<CameraDevice['formats']>([]);
  const [photoQualityBalance, setPhotoQualityBalance] = useState<'speed' | 'quality' | 'balanced'>('quality');

  // get current permission statuses on mount
  useEffect(() => {
    (async () => {
      try {
        const camStatus = await Camera.getCameraPermissionStatus();
        const micStatus = await Camera.getMicrophonePermissionStatus();
        setCameraPermission(camStatus);
        setMicrophonePermission(micStatus);
      } catch (err) {
        console.warn('Failed to get permission status', err);
      }
    })();
  }, []);

  // request permissions helper
  const requestPermissions = async () => {
    try {
      const cam = await Camera.requestCameraPermission();
      const mic = await Camera.requestMicrophonePermission();
      setCameraPermission(cam);
      setMicrophonePermission(mic);

      if (cam !== 'authorized' && cam !== 'granted') {
        Alert.alert('Camera permission required');
      }
    } catch (err) {
      console.warn('Request permission failed', err);
      Alert.alert('Permission error', String(err));
    }
  };

  // populate formats when device is available
  useEffect(() => {
    if (device && (device as CameraDevice).formats) {
      setFormats((device as CameraDevice).formats ?? []);
    }
  }, [device]);

  // minimal frame processor (worklet). frame typed as any to avoid TS friction.
  const frameProcessor = useFrameProcessor((frame: any) => {
    'worklet';
    // stub — use plugins for real processing
  }, []);

  // --- Camera actions ---
  const takePhoto = async () => {
    if (!camera.current) {
      Alert.alert('Camera not ready');
      return;
    }
    try {
      const photoFile = await camera.current.takePhoto({
        flash,
        qualityPrioritization: photoQualityBalance,
      });
      console.log('Photo taken:', photoFile);
      Alert.alert('Photo taken', JSON.stringify(photoFile));
    } catch (e: any) {
      console.error('takePhoto error', e);
      Alert.alert('Photo error', e?.message ?? String(e));
    }
  };

  const takeSnapshot = async () => {
    if (!camera.current) {
      Alert.alert('Camera not ready');
      return;
    }
    try {
      const snap = await camera.current.takeSnapshot({ quality: 90 });
      console.log('Snapshot', snap);
      Alert.alert('Snapshot taken', JSON.stringify(snap));
    } catch (e: any) {
      console.error('snapshot error', e);
      Alert.alert('Snapshot error', e?.message ?? String(e));
    }
  };

  const startRecording = async () => {
    if (!camera.current) {
      Alert.alert('Camera not ready');
      return;
    }
    try {
      setIsRecording(true);
      await camera.current.startRecording({
        flash,
        onRecordingFinished: (video) => {
          console.log('Recording finished:', video);
          setIsRecording(false);
          Alert.alert('Recording finished', JSON.stringify(video));
        },
        onRecordingError: (err) => {
          console.error('Recording error:', err);
          setIsRecording(false);
          Alert.alert('Recording error', JSON.stringify(err));
        },
      });
    } catch (e: any) {
      console.error('startRecording error', e);
      setIsRecording(false);
      Alert.alert('Recording start failed', e?.message ?? String(e));
    }
  };

  const stopRecording = async () => {
    if (!camera.current) return;
    try {
      await camera.current.stopRecording();
      setIsRecording(false);
    } catch (e: any) {
      console.error('stopRecording error', e);
    }
  };

  const pauseRecording = async () => {
    if (!camera.current) return;
    try {
      await camera.current.pauseRecording();
    } catch (e: any) {
      console.error('pauseRecording error', e);
    }
  };

  const resumeRecording = async () => {
    if (!camera.current) return;
    try {
      await camera.current.resumeRecording();
    } catch (e: any) {
      console.error('resumeRecording error', e);
    }
  };

  const toggleDevice = () => setDevicePosition((p) => (p === 'back' ? 'front' : 'back'));
  const toggleFlash = () => setFlash((f) => (f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off'));
  const toggleTorch = () => setTorchOn((t) => !t);

  const hasPermission = cameraPermission === 'authorized' || cameraPermission === 'granted';

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ marginBottom: 10 }}>Camera permission: {String(cameraPermission)}</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Request Permissions</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading camera device...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera preview */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        photo
        video
        audio
        torch={torchOn ? 'on' : 'off'}
        frameProcessor={frameProcessor}
        zoom={zoom}
      />

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.info}>Device: {devicePosition} • Formats: {formats?.length ?? 0}</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleDevice}>
            <Text>Switch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleFlash}>
            <Text>Flash: {flash}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleTorch}>
            <Text>{torchOn ? 'Torch On' : 'Torch Off'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 10, alignItems: 'center' }}>
          <Text>Zoom: {zoom.toFixed(2)}</Text>
          <Slider
            value={zoom}
            onValueChange={(v: number) => setZoom(v)}
            minimumValue={(device as CameraDevice).minZoom ?? 0}
            maximumValue={(device as CameraDevice).maxZoom ?? 1}
            style={{ width: 220 }}
          />
        </View>

        <View style={styles.rowActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
            <Text>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={takeSnapshot}>
            <Text>Snap</Text>
          </TouchableOpacity>

          {!isRecording ? (
            <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
              <Text style={{ color: 'white' }}>Record</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
              <Text style={{ color: 'white' }}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        {isRecording && (
          <View style={styles.row}>
            <TouchableOpacity style={styles.controlBtn} onPress={pauseRecording}>
              <Text>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={resumeRecording}>
              <Text>Resume</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => setIsActive((s) => !s)}>
          <Text>{isActive ? 'Deactivate' : 'Activate'} Preview</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  row: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  rowActions: { flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'center' },
  button: { backgroundColor: '#1976D2', padding: 10, borderRadius: 8 },
  buttonText: { color: '#fff' },
  controlBtn: {
    backgroundColor: '#eee',
    padding: 8,
    marginHorizontal: 6,
    borderRadius: 6,
  },
  actionBtn: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 6,
    borderRadius: 50,
    minWidth: 90,
    alignItems: 'center',
  },
  recordBtn: {
    backgroundColor: 'red',
    padding: 10,
    marginHorizontal: 6,
    borderRadius: 50,
    minWidth: 90,
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: 'darkred',
    padding: 10,
    marginHorizontal: 6,
    borderRadius: 50,
    minWidth: 90,
    alignItems: 'center',
  },
  info: { color: '#fff', marginBottom: 8 },
});
