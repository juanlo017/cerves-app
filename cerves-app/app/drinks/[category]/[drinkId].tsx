import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { consumptionsApi } from '@/lib/api';
import { Card, Typography, IconButton, QuantitySelector } from '@/components/ui';
import { Theme } from '@/constants/Theme';
import { TouchableOpacity } from 'react-native';

export default function AddConsumptionScreen() {
  const { category, drinkId } = useLocalSearchParams<{ category: string; drinkId: string }>();
  
  console.log('📍 AddConsumptionScreen mounted');
  console.log('📦 Category:', category);
  console.log('📦 DrinkId:', drinkId);

  const { player } = useAuth();
  const [drink, setDrink] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDrink();
  }, [drinkId]);

  const loadDrink = async () => {
    const allDrinks = [
      { id: '1', name: 'Estrella Galicia', liters_per_unit: 0.33, kcal_per_unit: 142 },
      { id: '2', name: 'Mahou', liters_per_unit: 0.33, kcal_per_unit: 139 },
      { id: '3', name: 'Cruzcampo', liters_per_unit: 0.33, kcal_per_unit: 140 },
      { id: '4', name: 'Tinto Copa', liters_per_unit: 0.15, kcal_per_unit: 125 },
      { id: '5', name: 'Blanco Copa', liters_per_unit: 0.15, kcal_per_unit: 121 },
      { id: '6', name: 'Rosado Copa', liters_per_unit: 0.15, kcal_per_unit: 120 },
      { id: '7', name: 'Gin Tonic', liters_per_unit: 0.25, kcal_per_unit: 200 },
      { id: '8', name: 'Mojito', liters_per_unit: 0.30, kcal_per_unit: 217 },
      { id: '9', name: 'Margarita', liters_per_unit: 0.20, kcal_per_unit: 168 },
    ];
    
    const foundDrink = allDrinks.find(d => d.id === drinkId);
    setDrink(foundDrink);
    setCustomPrice('');
  };

  const handleSubmit = async () => {
    if (!player || !drink) return;

    const price = parseFloat(customPrice) || 0;
    
    if (isNaN(price) || price < 0) {
      Alert.alert('Error', 'Por favor ingresa un precio válido');
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Replace with real API call
      // await consumptionsApi.create(player.id, drinkId, quantity, price, undefined, null);
      
      console.log('Creating consumption:', {
        player_id: player.id,
        drink_id: drinkId,
        quantity,
        eur_spent: price,
      });
      
      Alert.alert(
        '¡Añadido!',
        `${quantity}x ${drink.name} registrado por ${price.toFixed(2)}€`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating consumption:', error);
      Alert.alert('Error', 'No se pudo registrar la bebida');
    } finally {
      setIsLoading(false);
      router.push('/add');
    }
  };

  if (!drink) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <Typography variant="body">Cargando...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  const totalPrice = parseFloat(customPrice) || 0;
  const totalLiters = drink.liters_per_unit * quantity;
  const totalCalories = drink.kcal_per_unit * quantity;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="◀" onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <Typography variant="h3" align="center">
            {drink.name}
          </Typography>
        </View>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Typography variant="h2" align="center" color={Theme.colors.primary}>
            CANTIDAD
          </Typography>
          
          <View style={styles.quantityContainer}>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity(q => q + 1)}
              onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
              onChange={setQuantity}
            />
          </View>
        </Card>

        <Card>
          <Typography variant="h3" align="center">
            PRECIO TOTAL
          </Typography>
          
          <View style={styles.priceContainer}>
            <TextInput
              style={styles.priceInput}
              value={customPrice}
              onChangeText={setCustomPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Theme.colors.textMuted}
            />
            <Typography variant="h2" color={Theme.colors.primary}>
              €
            </Typography>
          </View>
          
          <Typography variant="caption" align="center" style={{ marginTop: Theme.spacing.sm }}>
            Ingresa el precio total pagado
          </Typography>
        </Card>

        <Card>
          <Typography variant="h3" align="center" style={{ marginBottom: Theme.spacing.md }}>
            RESUMEN
          </Typography>
          
          <View style={styles.summaryRow}>
            <Typography variant="body" color={Theme.colors.textSecondary}>
              Total litros:
            </Typography>
            <Typography variant="body" color={Theme.colors.primary}>
              {totalLiters.toFixed(2)}L
            </Typography>
          </View>
          
          <View style={styles.summaryRow}>
            <Typography variant="body" color={Theme.colors.textSecondary}>
              Total calorías:
            </Typography>
            <Typography variant="body" color={Theme.colors.primary}>
              {totalCalories.toFixed(0)} kcal
            </Typography>
          </View>
          
          <View style={styles.summaryRow}>
            <Typography variant="body" color={Theme.colors.textSecondary}>
              Total precio:
            </Typography>
            <Typography variant="h3" color={Theme.colors.secondary}>
              {totalPrice.toFixed(2)}€
            </Typography>
          </View>
        </Card>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Typography variant="h2" align="center">
            {isLoading ? 'GUARDANDO...' : 'REGISTRAR'}
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Theme.spacing.md,
  },
  quantityContainer: {
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  priceInput: {
    fontSize: Theme.fontSize.xxxl,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.pixel,
    backgroundColor: Theme.colors.backgroundCard,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    textAlign: 'center',
    minWidth: 120,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Theme.spacing.sm,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.xl,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: Theme.colors.disabled,
    borderColor: Theme.colors.disabled,
  },
});