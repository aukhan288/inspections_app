import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { fetchInspections } from '../redux/slices/inspectionSlice';
import { useNavigation } from '@react-navigation/native';


const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const { inspections, loading, error } = useSelector(
    (state: RootState) => state.inspection
  );

  useEffect(() => {
    if (token) {
      dispatch(fetchInspections(token));
    }
  }, [token]);

  if (loading) return <ActivityIndicator size="large" style={styles.center} />;
  if (error) return <Text style={styles.center}>Error: {error}</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={inspections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable style={styles.item}
           onPress={() =>
              navigation.navigate('InspectionDetail', {
                inspection: item,
              })

            }
          >
            <Text style={styles.header}>{item?.customer_address}</Text>
            <View style={styles.cardContainer}>
             <Text>{item?.customer_name}</Text>
             <Text>{item?.customer_contact}</Text>
             <Text>{item?.scheduled_at}</Text>


            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text>No inspections found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: {
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow:'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    // Android shadow
    elevation: 5,
    paddingBottom:10
  },

  header:{
    backgroundColor: '#103B38',
    color:'#F7B551',
    paddingHorizontal:10,
    paddingVertical:5
  },

  cardContainer:{
    paddingHorizontal:10,
    paddingVertical:10
  }
});


export default HomeScreen;
