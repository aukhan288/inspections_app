import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import type { AppDispatch } from '../../redux/store';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <Button title="Login" onPress={() => dispatch(login(username))} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { borderWidth: 1, marginBottom: 16, padding: 8, borderRadius: 4 },
});

export default LoginScreen;
