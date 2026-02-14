/**
 * Create — upload/post form for video content.
 */

import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { VideoHeader } from '@/components/media/video-header';
import { UploadForm } from '@/components/media/upload-form';

export default function CreateScreen() {
  return (
    <ThemedView style={styles.container}>
      <VideoHeader title="Create" />
      <UploadForm />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
