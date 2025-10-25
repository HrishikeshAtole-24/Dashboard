import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import GoalConversions from '../components/GoalConversions';

export default function GoalConversionsPage() {
  const router = useRouter();
  const { goalId, goalName } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (router.isReady) {
      setLoading(false);
    }
  }, [router.isReady]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!goalId) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Invalid Goal</h2>
            <p className="text-gray-600 mb-4">No goal selected for conversion viewing.</p>
            <button
              onClick={() => router.push('/goals')}
              className="btn btn-primary"
            >
              Back to Goals
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <GoalConversions goalId={goalId} goalName={goalName} />
    </DashboardLayout>
  );
}