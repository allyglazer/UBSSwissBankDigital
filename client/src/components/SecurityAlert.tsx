import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SecurityAlertProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  title?: string;
}

export function SecurityAlert({ 
  isOpen, 
  onClose, 
  message = "Please contact support for security purposes.",
  title = "Security Notice"
}: SecurityAlertProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>
          <Button 
            onClick={onClose} 
            className="w-full bg-ubs-red hover:bg-red-700"
          >
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
