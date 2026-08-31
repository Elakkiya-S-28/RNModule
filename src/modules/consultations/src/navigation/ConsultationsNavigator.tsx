import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ConsultationsStackParamList } from '../../../../app/navigation/types';
import { DoctorListScreen } from '../container/DoctorListScreen';
import { DoctorDetailsScreen } from '../container/DoctorDetailsScreen';
import { UpcomingConsultations } from '../container/UpcomingConsultations';
import { Doctor } from '../types/ct';

const Stack = createNativeStackNavigator<ConsultationsStackParamList>();

export function ConsultationsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DoctorList">
        {({ navigation }) => (
          <DoctorListScreen
            onDoctorPress={(doctor: Doctor) =>
              navigation.navigate('DoctorDetails', { doctor })
            }
            onUpcomingPress={() => navigation.navigate('Upcoming')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreenWrapper} />
      <Stack.Screen name="Upcoming" component={UpcomingConsultationsWrapper} />
    </Stack.Navigator>
  );
}

type DDProps = NativeStackScreenProps<ConsultationsStackParamList, 'DoctorDetails'>;
function DoctorDetailsScreenWrapper({ route, navigation }: DDProps) {
  const doctor = route.params.doctor ?? null;
  const doctorId = doctor?.id ?? route.params.doctorId ?? '';
  return (
    <DoctorDetailsScreen
      doctorId={doctorId}
      onBack={() => navigation.goBack()}
      onBooked={() => navigation.navigate('Upcoming')}
    />
  );
}

type UpProps = NativeStackScreenProps<ConsultationsStackParamList, 'Upcoming'>;
function UpcomingConsultationsWrapper({ navigation }: UpProps) {
  return <UpcomingConsultations onBack={() => navigation.goBack()} />;
}

export default ConsultationsNavigator;
