"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { resetSessionAction } from "@/actions/session.actions";
import { RotateCcw, Loader2 } from "lucide-react";

interface ResetSessionButtonProps {
  sessionId: string;
}

export function ResetSessionButton({ sessionId }: ResetSessionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetSessionAction(sessionId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Session réinitialisée - vous pouvez retester l'enregistrement");
      router.refresh();
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
          <RotateCcw className="mr-2 h-4 w-4" />
          Réinitialiser (test)
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Réinitialiser la session ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action va supprimer l'enregistrement audio, la transcription et le résumé de cette session.
            Vous pourrez ensuite retester l'enregistrement depuis le début.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Réinitialiser
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
