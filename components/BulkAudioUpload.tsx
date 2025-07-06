import React, { useState } from 'react';
import { View, Button, Text, FlatList, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentPickerAsset, DocumentPickerResult } from 'expo-document-picker';
import { supabase } from '../lib/supabase';

import * as FileSystem from 'expo-file-system';

async function uploadFile(file: DocumentPickerAsset) {
    // Read the file as a binary string and convert to a Blob
    const fileUri = file.uri;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
        return { name: file.name, error: { message: 'File does not exist' } };
    }
    const fileData = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    const filePath = `${Date.now()}_${file.name}`;
    // Convert base64 to Blob (React Native workaround)
    const buffer = Uint8Array.from(atobPolyfill(fileData), c => c.charCodeAt(0));
    const blob = new Blob([buffer], { type: file.mimeType || 'audio/mpeg' });

    // Polyfill for atob in React Native
    function atobPolyfill(input: string): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = input.replace(/=+$/, '');
        let output = '';

        if (str.length % 4 === 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (
            let bc = 0, bs = 0, buffer, i = 0;
            (buffer = str.charAt(i++));
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4)
                ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6))
                : 0
        ) {
            buffer = chars.indexOf(buffer);
        }
        return output;
    }

    const { error } = await supabase.storage
        .from('audio')
        .upload(filePath, blob, {
            contentType: file.mimeType || 'audio/mpeg',
            upsert: false,
        });
    return { name: file.name, error };
}

const BulkAudioUpload: React.FC = () => {
    const [files, setFiles] = useState<DocumentPickerAsset[]>([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<{ name: string; error: any }[]>([]);

    const pickFiles = async () => {
        const result: DocumentPickerResult = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
            multiple: true,
            copyToCacheDirectory: false,
        });
        if (!result.canceled && result.assets) {
            setFiles(result.assets);
            setResults([]);
        }
    };

    const uploadAll = async () => {
        setUploading(true);
        const uploadResults = [];
        for (const file of files) {
            uploadResults.push(await uploadFile(file));
        }
        setResults(uploadResults);
        setUploading(false);
    };

    return (
        <View style={{ padding: 20 }}>
            <Button title="Pick Audio Files" onPress={pickFiles} />
            {files.length > 0 && (
                <Button title="Upload All" onPress={uploadAll} disabled={uploading} />
            )}
            {uploading && <ActivityIndicator size="large" />}
            <FlatList
                data={results}
                keyExtractor={item => item.name}
                renderItem={({ item }) => (
                    <Text style={{ color: item.error ? 'red' : 'green' }}>
                        {item.error
                            ? `Failed: ${item.name} (${item.error.message})`
                            : `Uploaded: ${item.name}`}
                    </Text>
                )}
            />
        </View>
    );
};

export default BulkAudioUpload;