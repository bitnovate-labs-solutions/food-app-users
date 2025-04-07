import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function InterestedUsersModal({
  isOpen,
  onClose,
  interestedUsers,
}) {
  // Log the interested users to check for duplicates
  console.log('Interested Users:', interestedUsers);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border-none shadow-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-bold">Interested Treatees</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {interestedUsers?.map((interest, index) => {
              // Create a unique key using multiple fields
              const uniqueKey = `${interest.purchase_id}-${interest.treatee.id}-${interest.expressed_at}`;
              console.log('Rendering interest with key:', uniqueKey);
              
              return (
                <div
                  key={uniqueKey}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={interest.treatee.user_profile_images?.[0]?.image_url}
                        alt={interest.treatee.display_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{interest.treatee.display_name}</p>
                      <p className="text-sm text-gray-500">
                        Expressed interest on{" "}
                        {new Date(interest.expressed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      interest.status === "pending"
                        ? "secondary"
                        : interest.status === "accepted"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {interest.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
