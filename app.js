import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { 
  Ionicons, 
  FontAwesome, 
  FontAwesome5, 
  MaterialIcons,
  Feather 
} from '@expo/vector-icons';

export default function RootLayout() {
  const [loaded] = useFonts({
    Ionicons: Ionicons.font,
    FontAwesome: FontAwesome.font,
    FontAwesome5: FontAwesome5.font,
    MaterialIcons: MaterialIcons.font,
    Feather: Feather.font,
  });

  if (!loaded) return null;

  return <Slot />;
}
