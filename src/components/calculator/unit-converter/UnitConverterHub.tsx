
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Weight, Thermometer, HardDrive, Zap, Square, Box, Clock, Flame, Gauge } from 'lucide-react';
import SingleUnitConverter from './SingleUnitConverter';
import { 
  lengthUnits, 
  massUnits, 
  temperatureUnits, 
  dataStorageUnits, 
  speedUnits,
  areaUnits,
  volumeUnits,
  timeUnits,
  energyUnits, // Added import
  powerUnits,   // Added import
  pressureUnits // Added import
} from '@/lib/unit-data';

const UnitConverterHub: React.FC = () => {
  const categoriesToShow = [
    { data: lengthUnits, icon: <Ruler className="h-4 w-4" /> },
    { data: massUnits, icon: <Weight className="h-4 w-4" /> },
    { data: temperatureUnits, icon: <Thermometer className="h-4 w-4" /> },
    { data: dataStorageUnits, icon: <HardDrive className="h-4 w-4" /> },
    { data: speedUnits, icon: <Zap className="h-4 w-4" /> },
    { data: areaUnits, icon: <Square className="h-4 w-4" /> },
    { data: volumeUnits, icon: <Box className="h-4 w-4" /> },
    { data: timeUnits, icon: <Clock className="h-4 w-4" /> },
    { data: energyUnits, icon: <Flame className="h-4 w-4" /> },
    { data: powerUnits, icon: <Zap className="h-4 w-4" /> }, // Re-using Zap for Power
    { data: pressureUnits, icon: <Gauge className="h-4 w-4" /> },
  ];

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Ruler className="mr-2 h-6 w-6 text-accent" /> {/* Generic icon for the hub */}
          Unit Converter (P)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue={categoriesToShow[0]?.data.name || 'Length'} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 mb-4">
            {categoriesToShow.map(catInfo => (
              <TabsTrigger 
                key={catInfo.data.name} 
                value={catInfo.data.name} 
                className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2"
              >
                {catInfo.icon} {catInfo.data.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categoriesToShow.map(catInfo => (
            <TabsContent key={catInfo.data.name} value={catInfo.data.name}>
              <SingleUnitConverter category={catInfo.data} />
            </TabsContent>
          ))}
        </Tabs>
         <p className="text-xs text-muted-foreground text-center pt-4">
          More unit categories will be added soon. Conversions are for informational purposes.
        </p>
      </CardContent>
    </Card>
  );
};

export default UnitConverterHub;
