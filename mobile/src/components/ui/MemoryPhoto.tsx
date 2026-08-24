import { Image, type ImageStyle, type StyleProp, type TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Ratings } from '@/constants/theme';

interface Props {
  photoUrl: string | null;
  rating: number | null | undefined;
  imageStyle: StyleProp<ImageStyle>;
  emojiStyle: StyleProp<TextStyle>;
}

// A memory's photo, or its rating emoji (✅ if unrated) when there's no
// photo — shared by the board note, memories grid card, and memory detail
// view, which each frame this differently but render the same fallback.
export function MemoryPhoto({ photoUrl, rating, imageStyle, emojiStyle }: Props) {
  if (photoUrl) return <Image source={{ uri: photoUrl }} style={imageStyle} />;
  return <ThemedText style={emojiStyle}>{rating != null ? Ratings[rating] : '✅'}</ThemedText>;
}
