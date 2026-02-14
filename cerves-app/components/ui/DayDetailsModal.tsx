import { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, ScrollView, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { consumptionsApi, type ConsumptionWithDrink } from '@/lib/api/consumptions';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';
import { Card } from './Card';

interface DayDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  date: string | null;
  playerId: string;
}

interface GroupedConsumption {
  drinkName: string;
  category: string;
  quantity: number;
  totalLiters: number;
  totalKcal: number;
}

const glassImages = {
  empty: require('@/assets/images/secuenciaCerveza/secuenciaCerveza0.png'),
  quarter: require('@/assets/images/secuenciaCerveza/secuenciaCerveza1.png'),
  half: require('@/assets/images/secuenciaCerveza/secuenciaCerveza2.png'),
  full: require('@/assets/images/secuenciaCerveza/secuenciaCerveza3.png'),
  overflow: require('@/assets/images/secuenciaCerveza/secuenciaCerveza3.png'),
};

export function DayDetailsModal({ visible, onClose, date, playerId }: DayDetailsModalProps) {
  const [consumptions, setConsumptions] = useState<GroupedConsumption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLiters, setTotalLiters] = useState(0);

  useEffect(() => {
    if (visible && date) {
      loadConsumptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, date, playerId]);

  const loadConsumptions = async () => {
    if (!date) return;

    setIsLoading(true);
    try {
      const data = await consumptionsApi.getByDay(playerId, date);

      // Group consumptions by drink
      const grouped = data.reduce((acc: Record<string, GroupedConsumption>, consumption: ConsumptionWithDrink) => {
        const drinkId = consumption.drink_id;

        if (!acc[drinkId]) {
          acc[drinkId] = {
            drinkName: consumption.drinks.name,
            category: consumption.drinks.category,
            quantity: 0,
            totalLiters: 0,
            totalKcal: 0,
          };
        }

        acc[drinkId].quantity += consumption.qty;
        acc[drinkId].totalLiters += consumption.qty * consumption.drinks.liters_per_unit;
        acc[drinkId].totalKcal += consumption.qty * consumption.drinks.kcal_per_unit;

        return acc;
      }, {});

      const groupedArray = Object.values(grouped);
      setConsumptions(groupedArray);

      // Calculate total liters
      const total = groupedArray.reduce((sum, item) => sum + item.totalLiters, 0);
      setTotalLiters(total);
    } catch (error) {
      console.error('Error loading day consumptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGlassState = (liters: number) => {
    if (liters === 0) return 'empty';
    if (liters <= 1) return 'quarter';
    if (liters <= 1.5) return 'half';
    if (liters <= 2) return 'full';
    return 'overflow';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  if (!date) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <Card style={styles.modalCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Typography variant="h2" style={styles.dateText}>
                    {formatDate(date)}
                  </Typography>
                  <View style={styles.glassContainer}>
                    <Image
                      source={glassImages[getGlassState(totalLiters)]}
                      style={styles.glassImage}
                      resizeMode="contain"
                    />
                    <Typography variant="body" style={styles.litersText}>
                      {totalLiters.toFixed(1)}L
                    </Typography>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Typography variant="h2" style={styles.closeText}>
                    ×
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                  <Typography variant="body" align="center" style={styles.emptyText}>
                    Cargando...
                  </Typography>
                ) : consumptions.length === 0 ? (
                  <Typography variant="body" align="center" style={styles.emptyText}>
                    No hay consumiciones este día
                  </Typography>
                ) : (
                  consumptions.map((item, index) => (
                    <View key={index} style={styles.consumptionItem}>
                      <View style={styles.consumptionInfo}>
                        <Typography variant="body" style={styles.drinkName}>
                          {item.drinkName}
                        </Typography>
                        <Typography variant="caption" style={styles.drinkDetails}>
                          {item.totalLiters.toFixed(2)}L • {item.totalKcal.toFixed(0)} kcal
                        </Typography>
                      </View>
                      <View style={styles.quantityBadge}>
                        <Typography variant="body" style={styles.quantityText}>
                          x{item.quantity}
                        </Typography>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </Card>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create<{
  overlay: ViewStyle;
  modalContainer: ViewStyle;
  modalCard: ViewStyle;
  header: ViewStyle;
  headerContent: ViewStyle;
  dateText: TextStyle;
  glassContainer: ViewStyle;
  glassImage: ImageStyle;
  litersText: TextStyle;
  closeButton: ViewStyle;
  closeText: TextStyle;
  content: ViewStyle;
  emptyText: TextStyle;
  consumptionItem: ViewStyle;
  consumptionInfo: ViewStyle;
  drinkName: TextStyle;
  drinkDetails: TextStyle;
  quantityBadge: ViewStyle;
  quantityText: TextStyle;
}>({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    maxHeight: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerContent: {
    flex: 1,
  },
  dateText: {
    textTransform: 'capitalize',
    marginBottom: Theme.spacing.sm,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glassImage: {
    width: 32,
    height: 32,
  },
  litersText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: Theme.spacing.sm,
  },
  closeButton: {
    padding: Theme.spacing.xs,
    marginLeft: Theme.spacing.sm,
  },
  closeText: {
    color: '#FF4444',
    fontSize: 32,
    lineHeight: 32,
  },
  content: {
    maxHeight: 400,
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    paddingVertical: Theme.spacing.lg,
  },
  consumptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  consumptionInfo: {
    flex: 1,
  },
  drinkName: {
    fontWeight: 'bold',
    marginBottom: Theme.spacing.xs / 2,
  },
  drinkDetails: {
    color: Theme.colors.textSecondary,
  },
  quantityBadge: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    minWidth: 48,
    alignItems: 'center',
  },
  quantityText: {
    color: Theme.colors.backgroundCard,
    fontWeight: 'bold',
  },
});
