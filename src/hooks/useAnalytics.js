import { useQuery,  useQueryClient } from '@tanstack/react-query';
import { getAllAnalytics } from "../services/analytics/getAllAnalytics";
import { overallPerformance } from '../services/analytics/overallPerformance';


// Define analytics query keys
export const AnalyticsKeys = {
  all: ['analytics'],
  getAllAnalytics: (outlet) => ['analytics', 'all', outlet],
  overallPerformance: (outlet, year) => ['performance', outlet, year],
//   totalOrders: (outlet) => ['analytics', 'totalOrders', outlet],
//   totalPayments: (outlet) => ['analytics', 'totalPayments', outlet],
//   totalProducts: (outlet) => ['analytics', 'totalProducts', outlet],
//   totalUnResolvedChats: (outlet) => ['analytics', 'totalUnResolvedChats', outlet],
//   monthlyOrders: (outlet) => ['analytics', 'monthlyOrders', outlet],
//   monthlyPayments: (outlet) => ['analytics', 'monthlyPayments', outlet],
//   yearlyOrders: (outlet) => ['analytics', 'yearlyOrders', outlet],
//   yearlyPayments: (outlet) => ['analytics', 'yearlyPayments', outlet],
//   unresolvedChats: (outlet) => ['analytics', 'unresolvedChats', outlet],
};

export const useAnalytics = ({ active_outlet, year }) => {
  const queryClient = useQueryClient();

  // Query for getting all analytics
  const {
    data: allAnalyticsData,
    isLoading: isLoadingAllAnalytics,
    error: allAnalyticsError,
    isSuccess: allAnalyticsQuerySuccess
  } = useQuery({
    queryKey: AnalyticsKeys.getAllAnalytics(active_outlet),
    queryFn: () => getAllAnalytics(active_outlet),
    enabled: !!active_outlet,
    retry: (failureCount, error) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
    const {
    data: overallPerformanceData,
    isLoading: isLoadingOverallPerformance,
    error: overallPerformanceError,
    isSuccess: overallPerformanceQuerySuccess 
  } = useQuery({
    queryKey: AnalyticsKeys.overallPerformance(active_outlet),
    queryFn: () => overallPerformance(active_outlet, year),
    enabled: !!active_outlet || !!year,
    retry: (failureCount, error) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

//   // Query for total orders
//   const {
//     data: totalOrdersData,
//     isLoading: isLoadingTotalOrders,
//     error: totalOrdersError,
//     refetch: refetchTotalOrders
//   } = useQuery({
//     queryKey: AnalyticsKeys.totalOrders(active_outlet),
//     queryFn: () => totalOrders(active_outlet),
//     enabled: !!active_outlet,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   // Query for total payments
//   const {
//     data: totalPaymentsData,
//     isLoading: isLoadingTotalPayments,
//     error: totalPaymentsError,
//     refetch: refetchTotalPayments
//   } = useQuery({
//     queryKey: AnalyticsKeys.totalPayments(active_outlet),
//     queryFn: () => totalPayments(active_outlet),
//     enabled: !!active_outlet,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   // Query for total products
//   const {
//     data: totalProductsData,
//     isLoading: isLoadingTotalProducts,
//     error: totalProductsError,
//     refetch: refetchTotalProducts
//   } = useQuery({
//     queryKey: AnalyticsKeys.totalProducts(active_outlet),
//     queryFn: () => totalProducts(active_outlet),
//     enabled: !!active_outlet,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   // Query for total unresolved chats
//   const {
//     data: totalUnResolvedChatsData,
//     isLoading: isLoadingTotalUnResolvedChats,
//     error: totalUnResolvedChatsError,
//     refetch: refetchTotalUnResolvedChats
//   } = useQuery({
//     queryKey: AnalyticsKeys.totalUnResolvedChats(active_outlet),
//     queryFn: () => totalUnresolvedChats(active_outlet),
//     enabled: !!active_outlet,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   // Query for monthly orders
//   const {
//     data: monthlyOrdersData,
//     isLoading: isLoadingMonthlyOrders,
//     error: monthlyOrdersError,
//     refetch: refetchMonthlyOrders
//   } = useQuery({
//     queryKey: AnalyticsKeys.monthlyOrders(active_outlet),
//     queryFn: () => monthlyOrders(active_outlet),
//     enabled: !!active_outlet,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   // Query for monthly payments
//   const {
//     data: monthlyPaymentsData,
//     isLoading: isLoadingMonthlyPayments,
//     error: monthlyPaymentsError,
//     refetch: refetchMonthlyPayments
//   } = useQuery({
//     queryKey: AnalyticsKeys.monthlyPayments(active_outlet),
//     queryFn: () => monthlyPayments(active_outlet),
//     enabled: !!active_outlet,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   // Query for yearly orders
//   const {
//     data: yearlyOrdersData,
//     isLoading: isLoadingYearlyOrders,
//     error: yearlyOrdersError,
//     refetch: refetchYearlyOrders
//   } = useQuery({
//     queryKey: AnalyticsKeys.yearlyOrders(active_outlet),
//     queryFn: () => yearlyOrders(active_outlet),
//     enabled: !!active_outlet,
//     staleTime: 10 * 60 * 1000, // Yearly data can be cached longer
//     gcTime: 15 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   // Query for yearly payments
//   const {
//     data: yearlyPaymentsData,
//     isLoading: isLoadingYearlyPayments,
//     error: yearlyPaymentsError,
//     refetch: refetchYearlyPayments
//   } = useQuery({
//     queryKey: AnalyticsKeys.yearlyPayments(active_outlet),
//     queryFn: () => yearlyPayments(active_outlet),
//     enabled: !!active_outlet,
//     staleTime: 10 * 60 * 1000,
//     gcTime: 15 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   // Query for unresolved chats
//   const {
//     data: unresolvedChatsData,
//     isLoading: isLoadingUnresolvedChats,
//     error: unresolvedChatsError,
//     refetch: refetchUnresolvedChats
//   } = useQuery({
//     queryKey: AnalyticsKeys.unresolvedChats(active_outlet),
//     queryFn: () => UnresolveChats(active_outlet),
//     enabled: !!active_outlet,
//     staleTime: 2 * 60 * 1000, // Shorter cache for real-time chat data
//     gcTime: 5 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

  // Utility function to refresh all analytics
  const refreshAllAnalytics = () => {
    queryClient.invalidateQueries({ 
      queryKey: AnalyticsKeys.all 
    });
  };

  // Utility function to refresh specific analytics
//   const refreshAnalytics = (type) => {
//     if (type === 'all') {
//       refreshAllAnalytics();
//     } else {
//       queryClient.invalidateQueries({ 
//         queryKey: AnalyticsKeys[type](active_outlet) 
//       });
//     }
//   };

  // Check if any analytics is loading
  const isLoadingAnyAnalytics = 
    isLoadingAllAnalytics 
    // isLoadingTotalOrders ||
    // isLoadingTotalPayments ||
    // isLoadingTotalProducts ||
    // isLoadingTotalUnResolvedChats ||
    // isLoadingMonthlyOrders ||
    // isLoadingMonthlyPayments ||
    // isLoadingYearlyOrders ||
    // isLoadingYearlyPayments ||
    // isLoadingUnresolvedChats;

  // Collect all errors
  const analyticsErrors = {
    allAnalytics: allAnalyticsError,
    // totalOrders: totalOrdersError,
    // totalPayments: totalPaymentsError,
    // totalProducts: totalProductsError,
    // totalUnResolvedChats: totalUnResolvedChatsError,
    // monthlyOrders: monthlyOrdersError,
    // monthlyPayments: monthlyPaymentsError,
    // yearlyOrders: yearlyOrdersError,
    // yearlyPayments: yearlyPaymentsError,
    // unresolvedChats: unresolvedChatsError,
  };

  return {
    // Data
    allAnalyticsData,
    overallPerformanceData,
    // totalOrdersData,
    // totalPaymentsData,
    // totalProductsData,
    // totalUnResolvedChatsData,
    // monthlyOrdersData,
    // monthlyPaymentsData,
    // yearlyOrdersData,
    // yearlyPaymentsData,
    // unresolvedChatsData,

    // Loading states
    isLoadingAllAnalytics,
    isLoadingOverallPerformance,
    // isLoadingTotalOrders,
    // isLoadingTotalPayments,
    // isLoadingTotalProducts,
    // isLoadingTotalUnResolvedChats,
    // isLoadingMonthlyOrders,
    // isLoadingMonthlyPayments,
    // isLoadingYearlyOrders,
    // isLoadingYearlyPayments,
    // isLoadingUnresolvedChats,
    // isLoadingAnyAnalytics,

    // Success states
    allAnalyticsQuerySuccess,
    overallPerformanceQuerySuccess,

    // Errors
    analyticsErrors,
    overallPerformanceError,

    // Refetch functions
    // refetchTotalOrders,
    // refetchTotalPayments,
    // refetchTotalProducts,
    // refetchTotalUnResolvedChats,
    // refetchMonthlyOrders,
    // refetchMonthlyPayments,
    // refetchYearlyOrders,
    // refetchYearlyPayments,
    // refetchUnresolvedChats,

    // Utility functions
    refreshAllAnalytics,
    // refreshAnalytics,
  };
};