import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { HealthStackParamList } from '../../../../app/navigation/types';
import { HealthTimelineScreen } from '../screens/HealthTimelineScreen';
import { RecordDetailScreen } from '../screens/RecordDetailScreen';
import { getRecordById } from '../services/healthRepo';

const Stack = createNativeStackNavigator<HealthStackParamList>();

export function HealthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="HealthTimeline" component={TimelineWrapper} />
      <Stack.Screen name="RecordDetail" component={RecordDetailWrapper} />
    </Stack.Navigator>
  );
}

type TLProps = NativeStackScreenProps<HealthStackParamList, 'HealthTimeline'>;
function TimelineWrapper({ navigation }: TLProps) {
  return (
    <HealthTimelineScreen
      onRecordPress={r => navigation.navigate('RecordDetail', { recordId: r.id })}
    />
  );
}

type RDProps = NativeStackScreenProps<HealthStackParamList, 'RecordDetail'>;
function RecordDetailWrapper({ route, navigation }: RDProps) {
  const record = route.params.recordId ? getRecordById(route.params.recordId) : null;
  return <RecordDetailScreen record={record} onBack={() => navigation.goBack()} />;
}

export default HealthNavigator;