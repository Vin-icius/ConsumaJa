import React from 'react';
import { View, TextInput, Button, Alert } from 'react-native';

const LoginForm = () => {
    return (
        <View>
            <TextInput placeholder="Usuário" />
            <TextInput placeholder="Senha" secureTextEntry />
            <Button title="Login" onPress={() => Alert.alert("Login")}/>
        </View>
    );
};

export default LoginForm;
