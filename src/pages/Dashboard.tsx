import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Briefcase, 
  ClipboardList, 
  Sparkles,
  ArrowRight,
  Calendar,
  Bell
} from 'lucide-react';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { parseDate, parseDateTime } from '@/lib/dateUtils';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { useResumeStore } from '@/stores/resumeStore';
import { ApplicationStats } from '@/components/dashboard/ApplicationStats';

export default function Dashboard() {
  const navigate = useNavigate();
  const { masterResume, jobDescriptions, applications } = useResumeStore();

  const stats = {
    totalApplications: applications.length,
    activeApplications: applications.filter(a => ['applied', 'interview'].includes(a.status)).length,
    jobDescriptions: jobDescriptions.length,
    resumeComplete: masterResume.experience.length > 0 && masterResume.header.name,
  };

  const recentApplications = applications
    .sort((a, b) => parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime())
    .slice(0, 5);

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get upcoming interviews and reminders
  const upcomingItems = applications.flatMap((app) => {
    const items: { type: 'interview' | 'reminder'; date: Date; app: typeof app; details: string }[] = [];
    
    app.interviews?.forEach((interview) => {
      const interviewDate = parseDateTime(interview.date, interview.time);
      if (!interview.completed && (isToday(interviewDate) || isFuture(interviewDate))) {
        items.push({
          type: 'interview',
          date: interviewDate,
          app,
          details: `${interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} interview at ${interview.time}`,
        });
      }
    });

    app.reminders?.forEach((reminder) => {
      const reminderDate = parseDate(reminder.date);
      if (!reminder.completed && (isToday(reminderDate) || isFuture(reminderDate) || isPast(reminderDate))) {
        items.push({
          type: 'reminder',
          date: reminderDate,
          app,
          details: reminder.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        });
      }
    });

    return items;
  }).sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Your job application command center</p>
      </div>

      {/* Quick Stats - Updated styling to match Lovable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Applications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Applications</h3>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <ClipboardList className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.totalApplications}</p>
          <p className="text-sm text-gray-500">All time</p>
        </div>

        {/* Active Applications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Active Applications</h3>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <Sparkles className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeApplications}</p>
          <p className="text-sm text-gray-500">In progress</p>
        </div>

        {/* Job Descriptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Job Descriptions</h3>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats.jobDescriptions}</p>
          <p className="text-sm text-gray-500">Saved</p>
        </div>

        {/* Resume Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Resume Status</h3>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {stats.resumeComplete ? 'Complete' : 'Incomplete'}
          </p>
          <p className="text-sm text-gray-500">
            {stats.resumeComplete ? 'Ready to generate' : 'Needs setup'}
          </p>
        </div>
      </div>

      {/* Application Statistics */}
      {applications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Analytics</h2>
          <ApplicationStats applications={applications} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions + Status Overview + Upcoming */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3 hover:bg-gray-50"
                onClick={() => navigate('/resume')}
              >
                <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="flex-1 text-left">Edit Master Resume</span>
                <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3 hover:bg-gray-50"
                onClick={() => navigate('/jobs')}
              >
                <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="flex-1 text-left">Add Job Description</span>
                <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
              </Button>
              <Button 
                variant="default" 
                className="w-full justify-start h-auto py-3"
                onClick={() => navigate('/generate')}
              >
                <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="flex-1 text-left">Generate Application</span>
                <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
              </Button>
            </div>
          </div>

          {/* Status Overview */}
          {applications.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Status Overview</h2>
              <div className="space-y-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-1">
                    <StatusBadge status={status as any}>{status}</StatusBadge>
                    <span className="text-sm font-medium text-gray-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Interviews & Reminders */}
          {upcomingItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Upcoming
              </h2>
              <div className="space-y-4">
                {upcomingItems.map((item, index) => {
                  const isOverdue = isPast(item.date) && !isToday(item.date);
                  const isDueToday = isToday(item.date);
                  
                  return (
                    <div key={index} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={item.type === 'interview' ? 'default' : 'secondary'}
                          className={`text-xs ${isOverdue ? 'bg-red-500' : isDueToday ? 'bg-yellow-500' : ''}`}
                        >
                          {item.type === 'interview' ? 'Interview' : 'Reminder'}
                        </Badge>
                        <span className="text-gray-500">
                          {isOverdue ? 'Overdue' : isDueToday ? 'Today' : format(item.date, 'MMM d')}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{item.app.company} - {item.app.role}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.details}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Recent Applications</h2>
              {applications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-sm"
                  onClick={() => navigate('/tracker')}
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
            
            {recentApplications.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={ClipboardList}
                  title="No applications yet"
                  description="Start by adding your master resume and a job description, then generate your first application."
                  action={{
                    label: 'Get Started',
                    onClick: () => navigate('/resume'),
                  }}
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentApplications.map((app) => (
                  <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{app.role}</h3>
                        <p className="text-sm text-gray-600">{app.company}</p>
                      </div>
                      <StatusBadge status={app.status as any}>{app.status}</StatusBadge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {parseDate(app.applicationDate).toLocaleDateString()}
                      </span>
                      {app.location && <span>• {app.location}</span>}
                      {app.interviews && app.interviews.length > 0 && (
                        <span className="text-blue-600 font-medium">
                          • {app.interviews.filter(i => !i.completed).length} upcoming interview(s)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}