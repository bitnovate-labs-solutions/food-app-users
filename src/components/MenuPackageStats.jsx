import { useState } from 'react';
import { useExploreMenuPackageStats } from '@/hooks/useExploreMenuPackageStats';
import { useMenuPackages } from '@/hooks/useMenuPackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Package, Info, ChevronDown, ChevronUp } from 'lucide-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import LoadingComponent from '@/components/LoadingComponent';
import ErrorComponent from '@/components/ErrorComponent';

export default function MenuPackageStats() {
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get all menu packages
  const { data: menuPackages, isLoading: packagesLoading, error: packagesError } = useMenuPackages();
  
  // Get stats for selected package
  const { data: stats, isLoading: statsLoading, error: statsError } = useExploreMenuPackageStats(selectedPackageId);

  if (packagesLoading) return <LoadingComponent type="screen" text="Loading menu packages..." />;
  if (packagesError) return <ErrorComponent message={packagesError.message} />;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu Package Stats</h2>
      
      {/* Package Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuPackages?.map((pkg) => (
          <Card 
            key={pkg.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPackageId === pkg.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPackageId(pkg.id)}
          >
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{pkg.name}</CardTitle>
                  <p className="text-sm text-gray-500">{pkg.restaurant?.name}</p>
                </div>
                <Badge className={`${
                  pkg.package_type === 'basic' ? 'bg-sky-200 text-sky-600' :
                  pkg.package_type === 'mid' ? 'bg-purple-200 text-purple-600' :
                  'bg-orange-200 text-orange-600'
                }`}>
                  {pkg.package_type}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Stats Display */}
      {selectedPackageId && (
        <Card className="mt-6">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Package Statistics</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </div>
          </CardHeader>

          {statsLoading ? (
            <LoadingComponent type="inline" text="Loading stats..." />
          ) : statsError ? (
            <ErrorComponent message={statsError.message} />
          ) : stats ? (
            <CardContent className={`p-4 space-y-4 ${isExpanded ? '' : 'max-h-[200px] overflow-hidden'}`}>
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Package Details</h3>
                  <div className="text-sm">
                    <p><span className="text-gray-500">Name:</span> {stats.package_name}</p>
                    <p><span className="text-gray-500">Price:</span> RM {stats.price}</p>
                    <p><span className="text-gray-500">Type:</span> {stats.package_type}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Restaurant Info</h3>
                  <div className="text-sm">
                    <p><span className="text-gray-500">Name:</span> {stats.restaurant_name}</p>
                    <p><span className="text-gray-500">Location:</span> {stats.location}</p>
                    <p><span className="text-gray-500">Cuisine:</span> {stats.cuisine_type}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="font-medium text-gray-700">Purchases</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{stats.total_purchases}</span>
                    <div className="flex -space-x-2">
                      {stats.treater_avatars.map((treater) => (
                        <div key={treater.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                          <ImageWithFallback
                            src={treater.image_url}
                            alt="Treater"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-secondary" />
                    <h3 className="font-medium text-gray-700">Interests</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-secondary">{stats.total_interests}</span>
                    <div className="flex -space-x-2">
                      {stats.treatee_avatars.map((treatee) => (
                        <div key={treatee.id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                          <ImageWithFallback
                            src={treatee.image_url}
                            alt="Treatee"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Data (for debugging) */}
              {isExpanded && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Raw Data</h3>
                  <pre className="text-xs overflow-auto max-h-[200px]">
                    {JSON.stringify(stats, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          ) : (
            <CardContent className="p-4 text-center text-gray-500">
              No stats available for this package
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
} 