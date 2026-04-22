import { ScrollView, View } from 'react-native';
import { KeyRoundIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';

const PAT_STEPS = [
  'Open your Dokploy dashboard in a browser.',
  'Go to Settings -> Profile.',
  'In the API/CLI section, tap Generate.',
  'Copy the generated token and paste it here.',
];

type PatHelpSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function PatStep({ index, children }: { index: number; children: string }) {
  return (
    <View className="flex-row gap-3">
      <View className="bg-secondary h-8 w-8 items-center justify-center rounded-full">
        <Text className="text-sm font-semibold">{index}</Text>
      </View>
      <Text className="flex-1 pt-1 text-sm leading-5">{children}</Text>
    </View>
  );
}

export default function PatHelpSheet({ open, onOpenChange }: PatHelpSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-4">
        <ScrollView
          className="max-h-full"
          contentContainerClassName="gap-5 pb-1"
          showsVerticalScrollIndicator={false}>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <View className="bg-secondary rounded-full p-2">
                <Icon as={KeyRoundIcon} className="text-muted-foreground size-5" />
              </View>
              <Text variant="h4">Personal access token</Text>
            </View>
            <Text variant="muted" className="leading-5">
              Use a token from your Dokploy dashboard to connect this app.
            </Text>
          </View>

          <View className="gap-3">
            {PAT_STEPS.map((step, index) => (
              <PatStep key={step} index={index + 1}>
                {step}
              </PatStep>
            ))}
          </View>

          <View className="bg-secondary/60 border-border gap-2 rounded-lg border p-4">
            <Text className="text-sm font-semibold">Note</Text>
            <Text variant="muted" className="leading-5">
              Admins can generate tokens directly. Other users may need an admin to grant access. By
              default, Dokploy access tokens do not expire.
            </Text>
          </View>
        </ScrollView>

        <Button className="h-12 rounded-lg" onPress={() => onOpenChange(false)}>
          <Text>Got it</Text>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
