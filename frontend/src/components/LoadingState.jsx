import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-blue-600" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-gray-600 font-medium"
      >
        Analyzing your resume...
      </motion.div>
      <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "70%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default LoadingState;

