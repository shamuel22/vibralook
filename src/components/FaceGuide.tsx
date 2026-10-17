/** Functional framing marks only: an oval and four brackets, with no face detection. */
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, G, Path } from 'react-native-svg';

import { colors } from '@/theme';

export function FaceGuide() {
  return (
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={styles.guide}>
      {/* Fixed 100:130 frame so the oval never stretches with the preview's aspect ratio. */}
      <View style={styles.frame}>
        <Svg width="100%" height="100%" viewBox="0 0 100 130">
          {/* Dark halo under each white stroke keeps the guide visible on bright backgrounds. */}
          {[
            { color: colors.inkScrim, width: 1.4 },
            { color: colors.white, width: 0.5 },
          ].map((layer) => (
            <G key={layer.width}>
              <Ellipse cx={50} cy={65} rx={31} ry={48} stroke={layer.color} strokeWidth={layer.width} fill="none" />
              <Path
                d="M 19 9 H 9 Q 7 9 7 11 V 21 M 81 9 H 91 Q 93 9 93 11 V 21 M 7 109 V 119 Q 7 121 9 121 H 19 M 93 109 V 119 Q 93 121 91 121 H 81"
                stroke={layer.color}
                strokeWidth={layer.width}
                strokeLinecap="round"
                fill="none"
              />
            </G>
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  guide: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  frame: { width: '78%', maxHeight: '88%', aspectRatio: 100 / 130 },
});
