import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface PinPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
  description?: string;
}

export function PinPrompt({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Enter PIN",
  description = "Please enter your 4-digit PIN to continue"
}: PinPromptProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = () => {
    const pinValue = pin.join("");
    if (pinValue.length === 4) {
      onConfirm(pinValue);
      setPin(["", "", "", ""]);
    }
  };

  const handleClose = () => {
    setPin(["", "", "", ""]);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-ubs-red rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold text-center">
              {title}
            </DialogTitle>
            <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
              {description}
            </p>
          </div>
        </DialogHeader>
        
        <div className="flex justify-center space-x-3 my-6">
          {pin.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-ubs-red"
            />
          ))}
        </div>

        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={pin.join("").length !== 4}
            className="flex-1 bg-ubs-red hover:bg-red-700"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
