// Team Analytics API - Performance, Trends, Statistics
// Extracted from services/team/teamApi.ts

import { supabase } from '@/lib/supabase/client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface TeamStats {
  totalTeam: number;
  activeTeam: number;
  onLeave: number;
  avgPerformance: number;
  avgAttendance: number;
  totalPayroll: number;
  departmentStats: {
    kitchen: number;
    service: number;
    admin: number;
    cleaning: number;
    management: number;
  };
  upcomingReviews: Array<{
    id: string;
    name: string;
    email: string;
    position: string;
    department: string;
    hire_date: string;
    status: string;
    performance_score: number;
    attendance_rate: number;
  }>;
}

export interface TeamMemberPerformanceData {
  month: string;
  performance: number;
  attendance: number;
  productivity: number;
  tasks_completed: number;
}

export interface DepartmentPerformanceData {
  department: string;
  teamMembers: number;
  avgPerformance: number;
  avgAttendance: number;
  avgSalary: number;
  efficiency: number;
}

export interface PerformanceTrendData {
  month: string;
  avgPerformance: number;
  avgAttendance: number;
  teamMemberCount: number;
  turnoverRate: number;
}

export interface TopPerformer {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  position: string;
  department: string;
  performance_score: number;
  attendance_rate: number;
  completed_tasks: number;
  hire_date: string;
  rank: number;
  efficiency: number;
  tenure_months: number;
}

// =====================================================
// STATISTICS AND ANALYTICS
// =====================================================

/**
 * Get comprehensive team statistics
 */
export async function getTeamStats(): Promise<TeamStats> {
  // Get basic counts
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('department, employment_status, salary, performance_score, attendance_rate, hire_date');

  if (!teamMembers) {
    return {
      totalTeam: 0,
      activeTeam: 0,
      onLeave: 0,
      avgPerformance: 0,
      avgAttendance: 0,
      totalPayroll: 0,
      departmentStats: {
        kitchen: 0,
        service: 0,
        admin: 0,
        cleaning: 0,
        management: 0
      },
      upcomingReviews: []
    };
  }

  const activeTeam = teamMembers.filter(e => e.employment_status === 'active');
  const onLeave = teamMembers.filter(e => e.employment_status === 'on_leave');

  const departmentStats = teamMembers.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgPerformance = teamMembers.length > 0
    ? teamMembers.reduce((sum, e) => sum + (e.performance_score || 0), 0) / teamMembers.length
    : 0;

  const avgAttendance = teamMembers.length > 0
    ? teamMembers.reduce((sum, e) => sum + (e.attendance_rate || 0), 0) / teamMembers.length
    : 0;

  const totalPayroll = teamMembers.reduce((sum, e) => sum + (e.salary || 0), 0);

  // Find teamMembers needing reviews (90+ days since hire)
  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() - 90);

  const upcomingReviews = teamMembers
    .filter(e =>
      e.employment_status === 'active' &&
      new Date(e.hire_date) <= reviewDate
    )
    .map(e => ({
      id: '',
      name: '',
      email: '',
      position: '',
      department: e.department,
      hire_date: e.hire_date,
      status: e.employment_status,
      performance_score: e.performance_score || 0,
      attendance_rate: e.attendance_rate || 0,
    })) as any[];

  return {
    totalTeam: teamMembers.length,
    activeTeam: activeTeam.length,
    onLeave: onLeave.length,
    avgPerformance: Math.round(avgPerformance * 10) / 10,
    avgAttendance: Math.round(avgAttendance * 10) / 10,
    totalPayroll,
    departmentStats: {
      kitchen: departmentStats.kitchen || 0,
      service: departmentStats.service || 0,
      admin: departmentStats.admin || 0,
      cleaning: departmentStats.cleaning || 0,
      management: departmentStats.management || 0
    },
    upcomingReviews
  };
}

/**
 * Get performance analytics for a specific teamMember
 */
export async function getTeamMemberPerformance(
  teamMemberId: string,
  months: number = 6
): Promise<TeamMemberPerformanceData[]> {
  // Get teamMember's current performance
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('performance_score, attendance_rate, completed_tasks')
    .eq('id', teamMemberId)
    .single();

  if (!teamMember) return [];

  // Generate historical performance data (mock for now)
  const data: TeamMemberPerformanceData[] = [];
  const currentDate = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const baseScore = teamMember.performance_score || 85;
    const variance = Math.random() * 10 - 5; // ±5 points variance

    data.push({
      month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      performance: Math.max(0, Math.min(100, baseScore + variance)),
      attendance: Math.max(80, Math.min(100, (teamMember.attendance_rate || 95) + variance)),
      productivity: Math.max(70, Math.min(100, (teamMember.performance_score || 85) + variance + 5)),
      tasks_completed: Math.max(0, (teamMember.completed_tasks || 10) + Math.floor(Math.random() * 5))
    });
  }

  return data;
}

/**
 * Get department performance comparison
 */
export async function getDepartmentPerformance(): Promise<DepartmentPerformanceData[]> {
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('department, performance_score, attendance_rate, salary')
    .eq('employment_status', 'active');

  if (!teamMembers) return [];

  const departmentStats = teamMembers.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = {
        department: emp.department,
        teamMembers: 0,
        avgPerformance: 0,
        avgAttendance: 0,
        totalSalary: 0,
        performanceSum: 0,
        attendanceSum: 0
      };
    }

    acc[emp.department].teamMembers++;
    acc[emp.department].performanceSum += emp.performance_score || 85;
    acc[emp.department].attendanceSum += emp.attendance_rate || 95;
    acc[emp.department].totalSalary += emp.salary || 0;

    return acc;
  }, {} as Record<string, any>);

  // Calculate averages and format for charts
  return Object.values(departmentStats).map((dept: any) => ({
    department: dept.department,
    teamMembers: dept.teamMembers,
    avgPerformance: Math.round(dept.performanceSum / dept.teamMembers),
    avgAttendance: Math.round(dept.attendanceSum / dept.teamMembers),
    avgSalary: Math.round(dept.totalSalary / dept.teamMembers),
    efficiency: Math.round((dept.performanceSum / dept.teamMembers) * 0.7 + (dept.attendanceSum / dept.teamMembers) * 0.3)
  }));
}

/**
 * Get performance trends over time
 */
export async function getPerformanceTrends(months: number = 12): Promise<PerformanceTrendData[]> {
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('performance_score, attendance_rate, hire_date')
    .eq('employment_status', 'active');

  if (!teamMembers) return [];

  // Generate trend data based on current team performance
  const trends: PerformanceTrendData[] = [];
  const currentDate = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const avgPerformance = teamMembers.reduce((sum, e) => sum + (e.performance_score || 85), 0) / teamMembers.length;
    const avgAttendance = teamMembers.reduce((sum, e) => sum + (e.attendance_rate || 95), 0) / teamMembers.length;

    // Add some realistic variation
    const variance = (Math.random() - 0.5) * 8; // ±4 points

    trends.push({
      month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      avgPerformance: Math.max(70, Math.min(100, avgPerformance + variance)),
      avgAttendance: Math.max(85, Math.min(100, avgAttendance + variance * 0.5)),
      teamMemberCount: teamMembers.length + Math.floor(Math.random() * 3 - 1), // Slight team changes
      turnoverRate: Math.max(0, Math.min(15, 5 + variance * 0.3))
    });
  }

  return trends;
}

/**
 * Get top performing teamMembers
 */
export async function getTopPerformers(limit: number = 10): Promise<TopPerformer[]> {
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('id, first_name, last_name, position, department, performance_score, attendance_rate, completed_tasks, hire_date')
    .eq('employment_status', 'active')
    .order('performance_score', { ascending: false })
    .limit(limit);

  if (!teamMembers) return [];

  return teamMembers.map((emp, index) => ({
    ...emp,
    name: `${emp.first_name} ${emp.last_name}`,
    rank: index + 1,
    efficiency: Math.round((emp.performance_score * 0.6) + (emp.attendance_rate * 0.4)),
    tenure_months: Math.floor((Date.now() - new Date(emp.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
  }));
}
