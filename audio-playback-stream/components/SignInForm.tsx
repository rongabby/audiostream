import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
        const [errorMsg, setErrorMsg] = useState<string | null>(null);
        const [loading, setLoading] = useState(false);
    
        const handleSignIn = async () => {
            setErrorMsg(null);
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            setLoading(false);
            if (error) {
                setErrorMsg(error.message);
            } else {
                onSuccess && onSuccess();
            }
        };
    
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Sign In</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
                <Button title={loading ? "Signing In..." : "Sign In"} onPress={handleSignIn} disabled={loading} />
            </View>
        );
    }
    
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            padding: 16,
            backgroundColor: '#fff',
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 24,
            textAlign: 'center',
        },
        input: {
            height: 40,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 4,
            marginBottom: 12,
            paddingHorizontal: 8,
        },
        error: {
            color: 'red',
            marginBottom: 12,
            textAlign: 'center',
        },
    });
