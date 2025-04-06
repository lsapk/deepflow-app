
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AIInsightProps } from './insight-card/types';
import { ProductivityScore } from './insight-card/ProductivityScore';
import { InsightList } from './insight-card/InsightList';
import { LoadingState } from './insight-card/LoadingState';
import { NoDataMessage } from './insight-card/NoDataMessage';
import { useInsightData } from './insight-card/useInsightData';

export const AIInsightCard: React.FC<AIInsightProps> = ({ 
  title = "Insights IA",
  description = "Analyses personnalisées basées sur vos données",
  type = 'general'
}) => {
  const { 
    loading, 
    insights, 
    productivityScore, 
    lastUpdated, 
    hasData 
  } = useInsightData(type);

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  // Afficher un message si aucune donnée n'est disponible
  if (!hasData || insights.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <NoDataMessage />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          {title}
        </CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>{description}</span>
          <Badge variant="outline" className="text-xs">
            Mis à jour {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: fr })}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {productivityScore > 0 && (
          <ProductivityScore score={productivityScore} />
        )}
        
        <InsightList insights={insights} />
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full text-primary">
          <span>Analyse complète</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};
