import { useState } from 'react';
import { Image, StyleSheet, View, type LayoutChangeEvent, type ViewProps } from 'react-native';

import { Colors } from '@/constants/theme';

const TILE_SIZE = 554; // native pixel size of cork-bg.jpg

// Tiles the same cork-bg.jpg the original web app uses as its whole-app
// backdrop. Image's resizeMode="repeat" looked like the obvious tool for
// this, but it doesn't reliably tile all the way to the edges when the
// container isn't an exact multiple of the source image size — it leaves a
// gap (the background color showing through) past the last full tile. This
// instead measures the container and lays out exactly enough tiles to fully
// cover it.
export function CorkBackground({ children, style, ...rest }: ViewProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  }

  const cols = Math.ceil(size.width / TILE_SIZE);
  const rows = Math.ceil(size.height / TILE_SIZE);

  return (
    <View style={[styles.container, style]} onLayout={onLayout} {...rest}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => (
            <Image
              key={`${row}-${col}`}
              source={require('@/assets/images/cork-bg.jpg')}
              style={[styles.tile, { top: row * TILE_SIZE, left: col * TILE_SIZE }]}
            />
          ))
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, overflow: 'hidden' },
  tile: { position: 'absolute', width: TILE_SIZE, height: TILE_SIZE },
});
