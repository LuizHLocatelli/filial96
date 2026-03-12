import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Clock, Check, Edit2, X } from "lucide-react";
import { fetchTeamAlmoco, updateLunchTime } from "./services/escalasApi";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const ROLE_LABELS: Record<string, string> = {
  consultor_moveis: "Móveis",
  consultor_moda: "Moda",
  crediarista: "Crediário",
};

interface TeamMember {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  lunch_time: string | null;
}

export function HorariosAlmoco() {
  const { profile } = useAuth();
  const isManager = profile?.role === "gerente";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: team, isLoading } = useQuery({
    queryKey: ["team-almoco"],
    queryFn: fetchTeamAlmoco,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");

  const mutation = useMutation({
    mutationFn: ({ userId, time }: { userId: string; time: string | null }) => 
      updateLunchTime(userId, time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-almoco"] });
      setEditingId(null);
      toast({
        title: "Horário atualizado",
        description: "O horário de almoço foi salvo com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o horário de almoço.",
      });
    }
  });

  const calculateEndTime = (startTime: string) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + 90); // 1h30m
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const handleEdit = (user: TeamMember) => {
    setEditingId(user.id);
    setEditTime(user.lunch_time ? user.lunch_time.substring(0, 5) : "12:00");
  };

  const handleSave = (userId: string) => {
    mutation.mutate({ userId, time: editTime || null });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando equipe...</p>
      </div>
    );
  }

  // Group by role
  const groupedTeam = team?.reduce<Record<string, TeamMember[]>>((acc, user) => {
    const role = user.role;
    if (!acc[role]) acc[role] = [];
    acc[role].push(user as TeamMember);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Horários de Almoço</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie o horário fixo de almoço da equipe (duração de 1h30m).
          </p>
        </div>
      </div>

      {Object.entries(ROLE_LABELS).map(([role, label]) => {
        const users = groupedTeam?.[role];
        if (!users || users.length === 0) return null;

        return (
          <div key={role} className="space-y-3">
            <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
              <span className="h-px bg-border flex-1" />
              {label}
              <span className="h-px bg-border flex-1" />
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.map((user: TeamMember) => {
                const isEditing = editingId === user.id;
                
                return (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <Badge variant="secondary" className="text-[10px] mt-0.5">
                            {ROLE_LABELS[user.role] || user.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-md p-3 flex items-center justify-between">
                        {isEditing ? (
                          <div className="flex items-center gap-2 w-full">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="h-8 text-sm"
                            />
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                                onClick={() => handleSave(user.id)}
                                disabled={mutation.isPending}
                              >
                                {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => setEditingId(null)}
                                disabled={mutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary/70" />
                              {user.lunch_time ? (
                                <div className="text-sm font-medium">
                                  {user.lunch_time.substring(0, 5)} <span className="text-muted-foreground font-normal mx-1">às</span> {calculateEndTime(user.lunch_time)}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">Não definido</span>
                              )}
                            </div>
                            
                            {isManager && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleEdit(user)}
                              >
                                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
