/**
 * Temporary stand-in for screens not built yet (Etapa 1). Lets the full route map be
 * navigated end to end. Each stub is replaced by the real screen in Etapa 3.
 */
import { Link, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { colors, layout, radius, space } from '@/theme';

export function RouteStub({ title, next }: { title: string; next?: { href: Href; label: string }[] }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.body}>
        <AppText variant="eyebrow">Etapa 1 · ruta provisional</AppText>
        <AppText variant="h1">{title}</AppText>
        <View style={styles.links}>
          {next?.map((n) => (
            <Link key={n.label} href={n.href} style={styles.link}>
              <AppText variant="bodyStrong">{n.label} →</AppText>
            </Link>
          ))}
          <Link href="/dev/gallery" style={styles.link}>
            <AppText variant="bodyStrong">Galería dev →</AppText>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: layout.gutter, gap: space[4] },
  links: { gap: space[3], marginTop: space[4] },
  link: { padding: space[4], borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
});
