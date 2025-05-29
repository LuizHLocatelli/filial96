import { Card } from "@/components/ui/card";
import { useOrientacaoUpload } from "./hooks/useOrientacaoUpload";
import { OrientacaoForm } from "./components/OrientacaoForm";
import { PlusCircle, Upload } from "lucide-react";
import { motion } from "framer-motion";

interface OrientacaoUploaderProps {
  onSuccess?: () => void;
}

export function OrientacaoUploader({ onSuccess }: OrientacaoUploaderProps) {
  const { 
    form, 
    arquivo, 
    isUploading, 
    progress, 
    handleFileChange, 
    onSubmit 
  } = useOrientacaoUpload({ onSuccess });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="p-4 border-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm shadow-lg border border-border/50 m-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Nova Orientação</h3>
              <p className="text-sm text-muted-foreground">
                Envie uma nova orientação ou informativo para o setor de móveis
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <OrientacaoForm
            form={form}
            arquivo={arquivo}
            isUploading={isUploading}
            progress={progress}
            handleFileChange={handleFileChange}
            onSubmit={onSubmit}
          />
        </motion.div>
      </Card>
    </motion.div>
  );
}
