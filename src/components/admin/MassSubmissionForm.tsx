import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GameMode, TierLevel, PlayerRegion, DeviceType } from '@/services/playerService';

interface PlayerSubmission {
  ign: string;
  java_username?: string;
  uuid?: string;
  region: PlayerRegion;
  device: DeviceType;
  gamemode: GameMode;
  tier: TierLevel;
  score?: number;
}

const SUPPORTED_GAMEMODES: GameMode[] = [
  "Crystal",
  "skywars", 
  "midfight",
  "bridge",
  "UHC",
  "sumo",
  "nodebuff",
  "bedfight"
];

const TIER_LEVELS: TierLevel[] = [
  "HT1", "LT1", "HT2", "LT2", "HT3", "LT3", "HT4", "LT4", "HT5", "LT5", "Retired"
];

const REGIONS: PlayerRegion[] = ["NA", "EU", "ASIA", "OCE", "SA", "AF"];
const DEVICES: DeviceType[] = ["PC", "Mobile", "Console"];

export function MassSubmissionForm() {
  const [submissions, setSubmissions] = useState<PlayerSubmission[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<Partial<PlayerSubmission>>({});
  const [csvData, setCsvData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const addSubmission = () => {
    if (!currentSubmission.ign || !currentSubmission.region || !currentSubmission.device || 
        !currentSubmission.gamemode || !currentSubmission.tier) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newSubmission: PlayerSubmission = {
      ign: currentSubmission.ign,
      java_username: currentSubmission.java_username,
      uuid: currentSubmission.uuid,
      region: currentSubmission.region as PlayerRegion,
      device: currentSubmission.device as DeviceType,
      gamemode: currentSubmission.gamemode as GameMode,
      tier: currentSubmission.tier as TierLevel,
      score: currentSubmission.score,
    };

    setSubmissions([...submissions, newSubmission]);
    setCurrentSubmission({});
    
    toast({
      title: "Player Added",
      description: `${newSubmission.ign} added to submission queue`,
    });
  };

  const removeSubmission = (index: number) => {
    setSubmissions(submissions.filter((_, i) => i !== index));
  };

  const parseCsvData = () => {
    if (!csvData.trim()) {
      toast({
        title: "No Data",
        description: "Please enter CSV data to parse",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const requiredHeaders = ['ign', 'region', 'device', 'gamemode', 'tier'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast({
          title: "CSV Format Error",
          description: `Missing required columns: ${missingHeaders.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      const newSubmissions: PlayerSubmission[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        if (row.ign && row.region && row.device && row.gamemode && row.tier) {
          newSubmissions.push({
            ign: row.ign,
            java_username: row.java_username || undefined,
            uuid: row.uuid || undefined,
            region: row.region as PlayerRegion,
            device: row.device as DeviceType,
            gamemode: row.gamemode as GameMode,
            tier: row.tier as TierLevel,
            score: row.score ? parseInt(row.score) : undefined,
          });
        }
      }

      setSubmissions([...submissions, ...newSubmissions]);
      setCsvData('');
      
      toast({
        title: "CSV Parsed",
        description: `Added ${newSubmissions.length} players from CSV`,
      });
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const submitAll = async () => {
    if (submissions.length === 0) {
      toast({
        title: "No Submissions",
        description: "Please add players to submit",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would implement the actual submission logic
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: `Successfully submitted ${submissions.length} players`,
      });
      
      setSubmissions([]);
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to submit players. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const template = "ign,java_username,uuid,region,device,gamemode,tier,score\nExamplePlayer,,uuid-here,NA,PC,Crystal,HT1,85";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'player_submission_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Mass Player Submission</CardTitle>
          <CardDescription className="text-gray-400">
            Add multiple players at once using the form or CSV import
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual Entry Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="IGN *"
              value={currentSubmission.ign || ''}
              onChange={(e) => setCurrentSubmission({...currentSubmission, ign: e.target.value})}
              className="bg-gray-800/50 border-gray-600/50 text-white"
            />
            <Input
              placeholder="Java Username"
              value={currentSubmission.java_username || ''}
              onChange={(e) => setCurrentSubmission({...currentSubmission, java_username: e.target.value})}
              className="bg-gray-800/50 border-gray-600/50 text-white"
            />
            <Input
              placeholder="UUID"
              value={currentSubmission.uuid || ''}
              onChange={(e) => setCurrentSubmission({...currentSubmission, uuid: e.target.value})}
              className="bg-gray-800/50 border-gray-600/50 text-white"
            />
            <Select value={currentSubmission.region || ''} onValueChange={(value) => setCurrentSubmission({...currentSubmission, region: value as PlayerRegion})}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                <SelectValue placeholder="Region *" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {REGIONS.map(region => (
                  <SelectItem key={region} value={region} className="text-white hover:bg-gray-700">
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentSubmission.device || ''} onValueChange={(value) => setCurrentSubmission({...currentSubmission, device: value as DeviceType})}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                <SelectValue placeholder="Device *" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {DEVICES.map(device => (
                  <SelectItem key={device} value={device} className="text-white hover:bg-gray-700">
                    {device}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentSubmission.gamemode || ''} onValueChange={(value) => setCurrentSubmission({...currentSubmission, gamemode: value as GameMode})}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                <SelectValue placeholder="Gamemode *" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {SUPPORTED_GAMEMODES.map(gamemode => (
                  <SelectItem key={gamemode} value={gamemode} className="text-white hover:bg-gray-700">
                    {gamemode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentSubmission.tier || ''} onValueChange={(value) => setCurrentSubmission({...currentSubmission, tier: value as TierLevel})}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white">
                <SelectValue placeholder="Tier *" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {TIER_LEVELS.map(tier => (
                  <SelectItem key={tier} value={tier} className="text-white hover:bg-gray-700">
                    {tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Score (optional)"
              type="number"
              value={currentSubmission.score || ''}
              onChange={(e) => setCurrentSubmission({...currentSubmission, score: parseInt(e.target.value) || undefined})}
              className="bg-gray-800/50 border-gray-600/50 text-white"
            />
          </div>
          
          <Button onClick={addSubmission} className="w-full">
            Add Player to Queue
          </Button>

          {/* CSV Import */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">CSV Import</h3>
              <Button variant="outline" onClick={downloadTemplate} className="border-gray-600 text-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
            <Textarea
              placeholder="Paste CSV data here (ign,java_username,uuid,region,device,gamemode,tier,score)"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="bg-gray-800/50 border-gray-600/50 text-white min-h-[100px]"
            />
            <Button onClick={parseCsvData} variant="outline" className="border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              Parse CSV Data
            </Button>
          </div>

          {/* Submission Queue */}
          {submissions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">Submission Queue ({submissions.length} players)</h3>
                <Button 
                  onClick={submitAll} 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit All Players'}
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {submissions.map((submission, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        {submission.ign}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {submission.region}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {submission.device}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500 text-purple-400">
                        {submission.gamemode}
                      </Badge>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                        {submission.tier}
                      </Badge>
                      {submission.score && (
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          Score: {submission.score}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSubmission(index)}
                      className="text-red-400 hover:bg-red-400/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
