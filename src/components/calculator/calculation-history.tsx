import type { FC } from 'react';
import type { HistoryEntry } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';

interface CalculationHistoryProps {
  history: HistoryEntry[];
  onRecall: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

const CalculationHistory: FC<CalculationHistoryProps> = ({ history, onRecall, onClearHistory }) => {
  if (history.length === 0) {
    return (
      <Card className="w-full md:w-80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No history yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:w-80 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">History</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClearHistory} aria-label="Clear History">
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-3">
          <ul className="space-y-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="p-3 bg-muted/30 rounded-md shadow-sm hover:bg-muted/60 transition-colors cursor-pointer group"
                onClick={() => onRecall(entry)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onRecall(entry)}
                role="button"
                aria-label={`Recall calculation: ${entry.expression} = ${entry.result}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground truncate max-w-[180px]">{entry.expression}</p>
                    <p className="text-lg font-semibold text-foreground">{entry.result}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Recall this calculation">
                     <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <ins className="adsbygoogle"
             style={{ display: 'block', textAlign: 'center' }}
             data-ad-client="ca-pub-1074051846339488"
             data-ad-slot="8922282796"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
      </CardFooter>
    </Card>
  );
};

export default CalculationHistory;
