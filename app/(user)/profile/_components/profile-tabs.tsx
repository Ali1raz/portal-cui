import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdateProfileForm } from "./update-profile-form";
import { UserSessionsCard } from "./user-sessions-tab";
import { SecurityTab } from "./security-tab";
import { ThemesTab } from "./themes-tab";
import { userGetAllSessions } from "@/app/data/user/user-get-all-sessions";
import { requireSession } from "@/app/data/session/require-session";

const ProfileTabs = async () => {
  const [sessions, currentSession] = await Promise.all([
    userGetAllSessions(),
    requireSession(),
  ]);

  return (
    <div className="w-full max-w-5xl mb-8">
      <Tabs defaultValue={"update-profile"} className="gap-8">
        <TabsList className="rounded flex sm:**:px-8 **:px-4">
          <TabsTrigger
            value={"update-profile"}
            className="cursor-pointer relative z-10 rounded"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value={"sessions"}
            className=" cursor-pointer relative z-10 rounded"
          >
            Sessions
          </TabsTrigger>
          <TabsTrigger
            value={"security"}
            className="cursor-pointer relative z-10 rounded"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value={"preferences"}
            className="cursor-pointer relative z-10 rounded"
          >
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="update-profile">
          <UpdateProfileForm session={currentSession} />
        </TabsContent>

        <TabsContent value="sessions">
          <UserSessionsCard
            sessions={sessions}
            currentToken={currentSession.session.token}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="preferences">
          <ThemesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
