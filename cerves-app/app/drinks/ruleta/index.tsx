import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Text as SvgText, G, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { drinksApi, Drink } from '@/lib/api';
import { Typography, IconButton, Card } from '@/components/ui';
import { Theme } from '@/constants/Theme';

// ─── Wheel geometry ──────────────────────────────────────────────────────────
const WHEEL_SIZE = 280;
const CX = WHEEL_SIZE / 2;
const CY = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2 - 3;
const TEXT_RADIUS_RATIO = 0.65; // how far from center to place labels
const MIN_ANGLE_FOR_TEXT = 15;  // degrees — skip label if slice is narrower

// ─── Categories ──────────────────────────────────────────────────────────────
const WHEEL_CATEGORIES = [
  { id: 'cerveza',       label: 'CERVEZA',       icon: '🍺', color: '#FFB300' },
  { id: 'vino',          label: 'VINO',           icon: '🍷', color: '#9C27B0' },
  { id: 'alta_graduación', label: 'ALTA GRAD.',   icon: '🍸', color: '#00D4FF' },
];

// Two shades per category so adjacent same-category slices are visually distinct
const CATEGORY_COLOR_PAIRS: Record<string, [string, string]> = {
  cerveza:          ['#FFB300', '#E65100'],
  vino:             ['#9C27B0', '#6A1B9A'],
  alta_graduación:  ['#00D4FF', '#0077AA'],
};

const CATEGORY_ICONS: Record<string, string> = {
  cerveza: '🍺',
  vino: '🍷',
  alta_graduación: '🍸',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sectorPath(
  cx: number, cy: number, r: number,
  startDeg: number, endDeg: number
): string {
  // angles: 0 = top (12 o'clock), clockwise
  const startRad = ((startDeg - 90) * Math.PI) / 180;
  const endRad   = ((endDeg   - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return (
    `M ${cx} ${cy} ` +
    `L ${x1.toFixed(3)} ${y1.toFixed(3)} ` +
    `A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`
  );
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.substring(0, maxLen - 1) + '…' : str;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function RuletaScreen() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(['cerveza', 'vino', 'alta_graduación'])
  );
  const [drinks, setDrinks]           = useState<Drink[]>([]);
  const [isSpinning, setIsSpinning]   = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [showResult, setShowResult]   = useState(false);

  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // ── Load drinks for selected categories ──────────────────────────────────
  const loadDrinks = useCallback(async () => {
    if (selectedCategories.size === 0) { setDrinks([]); return; }
    try {
      const results = await Promise.all(
        Array.from(selectedCategories).map((cat) => drinksApi.getByCategory(cat))
      );
      setDrinks(results.flat());
    } catch {
      setDrinks([]);
    }
  }, [selectedCategories]);

  useEffect(() => { loadDrinks(); }, [loadDrinks]);

  // ── Toggle category ───────────────────────────────────────────────────────
  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return next;
    });
  };

  // ── Spin ──────────────────────────────────────────────────────────────────
  const onSpinComplete = () => {
    setIsSpinning(false);
    setShowResult(true);
  };

  const handleSpin = () => {
    if (drinks.length === 0 || isSpinning) return;

    const N             = drinks.length;
    const winnerIndex   = Math.floor(Math.random() * N);
    const segmentAngle  = 360 / N;
    // pointer is at top (0°); we want the mid-point of winning segment there
    const targetOffset  = (winnerIndex + 0.5) * segmentAngle;
    const totalRotation = rotation.value + 5 * 360 + (360 - targetOffset);

    setSelectedDrink(drinks[winnerIndex]);
    setIsSpinning(true);
    setShowResult(false);

    rotation.value = withTiming(
      totalRotation,
      { duration: 3200, easing: Easing.bezier(0.17, 0.67, 0.12, 0.99) },
      (finished) => { if (finished) runOnJS(onSpinComplete)(); }
    );
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleAddDrink = () => {
    if (!selectedDrink) return;
    setShowResult(false);
    router.push(`/drinks/${selectedDrink.category}/${selectedDrink.id}`);
  };

  const handleRespin = () => {
    setShowResult(false);
    setSelectedDrink(null);
  };

  // ── Render SVG pie slices ─────────────────────────────────────────────────
  const renderSlices = () => {
    const N = drinks.length;
    if (N === 0) return null;
    const sweepAngle = 360 / N;

    return drinks.map((drink, i) => {
      const startAngle = i * sweepAngle;
      const endAngle   = startAngle + sweepAngle;

      const colorPair = CATEGORY_COLOR_PAIRS[drink.category] ?? ['#00D4FF', '#0099CC'];
      const fill = colorPair[i % 2];

      const path = sectorPath(CX, CY, RADIUS, startAngle, endAngle);

      // Label: only when slice is wide enough
      const showText = sweepAngle >= MIN_ANGLE_FOR_TEXT;
      const midAngle  = startAngle + sweepAngle / 2;
      const midRad    = ((midAngle - 90) * Math.PI) / 180;
      const textR     = RADIUS * TEXT_RADIUS_RATIO;
      const textX     = CX + textR * Math.cos(midRad);
      const textY     = CY + textR * Math.sin(midRad);
      // rotate text to align radially (point outward)
      const textRot   = midAngle;

      const label = truncate(drink.name, 9);

      return (
        <G key={drink.id}>
          <Path
            d={path}
            fill={fill}
            stroke={Theme.colors.background}
            strokeWidth={1.5}
          />
          {showText && (
            <SvgText
              x={textX}
              y={textY}
              fontSize={7}
              fill="#FFFFFF"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${textRot}, ${textX.toFixed(2)}, ${textY.toFixed(2)})`}
            >
              {label}
            </SvgText>
          )}
        </G>
      );
    });
  };

  const canSpin = drinks.length > 0 && !isSpinning;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <IconButton icon="◀" onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <Typography variant="h2" align="center">🎡 RULETA</Typography>
        </View>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Category toggles ── */}
        <Card>
          <Typography variant="h3" align="center" style={{ marginBottom: Theme.spacing.md }}>
            CATEGORÍAS
          </Typography>
          <View style={styles.toggleRow}>
            {WHEEL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.has(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.toggleChip, isSelected && { backgroundColor: cat.color, borderColor: cat.color }]}
                  onPress={() => toggleCategory(cat.id)}
                >
                  <Text style={styles.toggleIcon}>{cat.icon}</Text>
                  <Typography
                    variant="caption"
                    style={isSelected ? styles.toggleTextSelected : styles.toggleText}
                  >
                    {cat.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* ── Wheel ── */}
        <View style={styles.wheelWrapper}>
          {/* Downward-pointing triangle pointer (▼) */}
          <View style={styles.pointer} />

          {/* Rotating disc */}
          <Animated.View style={animatedStyle}>
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
              {drinks.length > 0 ? (
                renderSlices()
              ) : (
                <Circle cx={CX} cy={CY} r={RADIUS} fill={Theme.colors.backgroundCard} />
              )}
              {/* Border ring */}
              <Circle
                cx={CX} cy={CY} r={RADIUS}
                fill="none"
                stroke={Theme.colors.primary}
                strokeWidth={3}
              />
              {/* Center hub */}
              <Circle
                cx={CX} cy={CY} r={13}
                fill={Theme.colors.secondary}
                stroke={Theme.colors.background}
                strokeWidth={2}
              />
            </Svg>
          </Animated.View>
        </View>

        {/* ── Drink count ── */}
        <Typography
          variant="caption"
          align="center"
          color={Theme.colors.textSecondary}
          style={{ marginBottom: Theme.spacing.md }}
        >
          {drinks.length > 0
            ? `${drinks.length} bebida${drinks.length !== 1 ? 's' : ''} en el bombo`
            : 'Selecciona al menos una categoría'}
        </Typography>

        {/* ── Spin button ── */}
        <TouchableOpacity
          style={[styles.spinButton, !canSpin && styles.spinButtonDisabled]}
          onPress={handleSpin}
          disabled={!canSpin}
        >
          <Typography variant="h2" align="center" color={Theme.colors.background}>
            {isSpinning ? 'GIRANDO...' : '¡GIRAR!'}
          </Typography>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Result overlay ── */}
      {showResult && selectedDrink && (
        <View style={styles.overlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultIcon}>
              {CATEGORY_ICONS[selectedDrink.category] ?? '🍹'}
            </Text>

            <Typography
              variant="h2"
              align="center"
              color={CATEGORY_COLOR_PAIRS[selectedDrink.category]?.[0] ?? Theme.colors.primary}
              style={{ marginBottom: Theme.spacing.sm }}
            >
              {selectedDrink.name}
            </Typography>

            <View style={styles.resultStats}>
              <View style={styles.statItem}>
                <Typography variant="caption" color={Theme.colors.textSecondary}>Litros</Typography>
                <Typography variant="body" color={Theme.colors.primary}>
                  {selectedDrink.liters_per_unit.toFixed(2)}L
                </Typography>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Typography variant="caption" color={Theme.colors.textSecondary}>Calorías</Typography>
                <Typography variant="body" color={Theme.colors.primary}>
                  {selectedDrink.kcal_per_unit} kcal
                </Typography>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddDrink}>
              <Typography variant="h3" align="center" color={Theme.colors.background}>
                AÑADIR
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.respinButton} onPress={handleRespin}>
              <Typography variant="h3" align="center" color={Theme.colors.primary}>
                VOLVER A GIRAR
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.backgroundLight,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: Theme.spacing.md,
  },
  scrollContent: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },

  // Category toggles
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    flexWrap: 'wrap',
  },
  toggleChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.backgroundCard,
    alignItems: 'center',
    minWidth: 90,
  },
  toggleIcon: { fontSize: 20, marginBottom: 2 },
  toggleText:         { color: Theme.colors.textSecondary },
  toggleTextSelected: { color: Theme.colors.background },

  // Wheel
  wheelWrapper: {
    alignItems: 'center',
    paddingTop: 28,       // room so the pointer sits above the disc
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
    position: 'relative',
  },
  pointer: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    // ▼ downward-pointing triangle via border trick
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderTopWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Theme.colors.secondary,
  },

  // Spin button
  spinButton: {
    backgroundColor: Theme.colors.secondary,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.sm,
    borderWidth: 2,
    borderColor: Theme.colors.secondaryDark,
  },
  spinButtonDisabled: {
    backgroundColor: Theme.colors.disabled,
    borderColor: Theme.colors.disabled,
  },

  // Result overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  resultCard: {
    backgroundColor: Theme.colors.backgroundLight,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: Theme.spacing.md,
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.md,
    gap: Theme.spacing.lg,
  },
  statItem:   { alignItems: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: Theme.colors.border },
  addButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    width: '100%',
    marginTop: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Theme.colors.primaryDark,
  },
  respinButton: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    width: '100%',
    marginTop: Theme.spacing.sm,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    backgroundColor: 'transparent',
  },
});
