import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Edit3, TrendingUp } from 'lucide-react';

const ResultsDisplay = ({ results }) => {
  if (!results) return null;

  const { score, analysis, suggested_edits } = results;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Score Card */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Match Score</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getScoreColor(score).split(' ')[0]}`}>
                {score}
              </span>
              <span className="text-gray-400">/ 100</span>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${getScoreColor(score)}`}>
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {analysis.strengths.map((strength, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{strength}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Critical Gaps */}
      {analysis.critical_gaps_and_irrelevance && analysis.critical_gaps_and_irrelevance.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Critical Gaps & Irrelevance</h3>
          </div>
          <ul className="space-y-3">
            {analysis.critical_gaps_and_irrelevance.map((gap, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{gap}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Suggested Edits */}
      {suggested_edits && suggested_edits.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Suggested Edits</h3>
          </div>
          <div className="space-y-4">
            {suggested_edits.map((edit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-blue-50 rounded-lg border border-blue-100"
              >
                <p className="text-xs font-medium text-blue-900 mb-2">{edit.location}</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Original:</p>
                    <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 line-through">
                      {edit.original}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Suggested:</p>
                    <p className="text-sm text-gray-900 bg-white p-2 rounded border border-blue-200">
                      {edit.suggested}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResultsDisplay;

