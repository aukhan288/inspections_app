import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/MainStack';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { useNavigation } from '@react-navigation/native';


type DetailRouteProp = RouteProp<MainStackParamList, 'InspectionDetail'>;

interface Question {
  id: number;
  question_text: string;
}

interface Measure {
  id: number;
  name: string;
  questions?: Question[];
}

interface Inspection {
  id: number;
  customer_name: string;
  customer_address: string;
  customer_contact: string;
  scheduled_at: string;
  measures?: Measure[];
}

const API_URL = 'https://inspections.compliantretrofits.co.uk/api';

const InspectionDetailScreen = () => {
 const navigation = useNavigation();

  const route = useRoute<DetailRouteProp>();
  const { inspection } = route.params;

  const token = useSelector((state: RootState) => state.auth.token);

  const [inspectionData, setInspectionData] = useState<Inspection>(inspection);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track expanded measures and questions
  const [expandedMeasures, setExpandedMeasures] = useState<number[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchMeasures = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/inspections/${inspection.id}`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API error ${response.status}`);
        }

        const measures: Measure[] = await response.json();

        setInspectionData(prev => ({
          ...prev,
          measures,
        }));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasures();
  }, [inspection.id, token]);

  const toggleMeasure = (id: number) => {
    setExpandedMeasures(prev =>
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{inspectionData.customer_name}</Text>

      <View style={styles.card}>
        <Text>Address: {inspectionData.customer_address}</Text>
        <Text>Contact: {inspectionData.customer_contact}</Text>
        <Text>Scheduled At: {inspectionData.scheduled_at}</Text>
      </View>

      {loading && <ActivityIndicator size="small" />}

      {error && <Text style={styles.error}>{error}</Text>}

      {inspectionData.measures && inspectionData.measures.length > 0 ? (
        inspectionData.measures.map(measure => (
          <View key={measure.id} style={styles.card}>
            <Pressable onPress={() => toggleMeasure(measure.id)}>
              <Text style={styles.toggleHeader}>
                {measure.name}{' '}
                {expandedMeasures.includes(measure.id) ? '▲' : '▼'}
              </Text>
            </Pressable>

            {expandedMeasures.includes(measure.id) && (
              <View style={{ marginTop: 8 }}>
                {measure.questions && measure.questions.length > 0 ? (
                  measure.questions.map(q => (
                    <View key={q.id}>
                    <Text  style={styles.question}>
                     {q?.content}
                    </Text>
                    <View>
                   <Pressable
                    style={{
                      borderStyle: 'dotted',
                      borderColor: '#000',
                      borderWidth: 2,
                      borderRadius: 8,
                      padding: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 20,
                      width: 60,
                      height: 60,
                    }}
                    onPress={() => navigation.navigate('CameraScreen', { inspectionId: inspection.id })}
                  >
                    <Text style={{ fontSize: 30, fontWeight: '400', textAlign: 'center' }}>+</Text>
                  </Pressable>

                    </View>
                 

                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No questions found.</Text>
                )}
              </View>
            )}
          </View>
        ))
      ) : (
        !loading && <Text style={styles.emptyText}>No measures found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 5,
  },
  toggleHeader: { fontWeight: 'bold', fontSize: 16 },
  question: { paddingLeft: 8, fontWeight:'700', paddingTop: 4, color: '#252525ff' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 6 },
  error: { color: 'red', textAlign: 'center', marginTop: 10 },
});

export default InspectionDetailScreen;
