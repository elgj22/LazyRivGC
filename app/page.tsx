 "use client";
import {useState, useRef, useEffect } from "react";
import {Home, Trophy, Flag, Bell, Users, CalendarDays, WalletCards, Settings, Plus, ChevronRight, Menu, X} from "lucide-react";
import { supabase } from "@/lib/supabase";
type Player = {
  id: string;
  trip_id: string;
  team_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  handicap: number | null;
  created_at: string;
  teams?: {
    id: string;
    name: string;
    color: string | null;
  }[] | null;
};

type Team = {
  id: string;
  trip_id: string;
  name: string;
  color: string | null;
  created_at?: string;
};
type Tee = {
  id: string;
  course_id: string;
  name: string;
  color: string | null;
  yardage: number | null;
  par: number | null;
  rating: number | null;
  slope: number | null;
  created_at?: string;
};
type Hole = {
  id?: string;
  course_id: string;
  hole_number: number;
  par: number;
  yardage: number | null;
  handicap_rank: number | null;
};
const matches=[
 {id:1,a:"Mike Johnson / Chris Smith",b:"Dave Brown / John Miller",status:"USA 2 UP",live:true},
 {id:2,a:"Tom / Steve",b:"Rob / Mark",status:"AS",live:true},
 {id:3,a:"John / Mark",b:"Steve / Rob",status:"USA WINS 3 & 2",live:false},
];

export default function App(){
 const [tab,setTab]=useState("Dashboard"),[mobile,setMobile]=useState(false),[notice,setNotice]=useState("");
 const [players, setPlayers] = useState<Player[]>([]);
 const [teams, setTeams] = useState<Team[]>([]);
 const [courses, setCourses] = useState<any[]>([]);
 const [tees, setTees] = useState<Tee[]>([]);
 const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
 const [holes, setHoles] = useState<Hole[]>([]);
 const [trips, setTrips] = useState<any[]>([]);
 
 const [selectedTripId, setSelectedTripId] =
  useState<string | null>(null);

  const [loginEmail, setLoginEmail] =
  useState("");

const [loginPassword, setLoginPassword] =
  useState("");

const [loginLoading, setLoginLoading] =
  useState(false);

const [loginError, setLoginError] =
  useState("");

  const [authUser, setAuthUser] =
  useState<any>(null);

const [userRole, setUserRole] =
  useState<"player" | "admin" | null>(null);

const [authLoading, setAuthLoading] =
  useState(true);

  useEffect(() => {
  async function loadAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setAuthUser(session?.user ?? null);
    setAuthLoading(false);
  }

  loadAuth();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setAuthUser(session?.user ?? null);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, []);

useEffect(() => {
  async function loadUserRole() {
    if (!authUser) {
      setUserRole(null);
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .single();

    if (error) {
      console.error(
        "Error loading user role:",
        error
      );
      setUserRole(null);
      return;
    }

    setUserRole(
      data.role === "admin"
        ? "admin"
        : "player"
    );

  }

  loadUserRole();
}, [authUser]);

useEffect(() => {
  if (
    userRole === "player" &&
    [
      "Trips",
      "Players",
      "Teams",
      "Courses",
      "Rounds",
      "Settings",
    ].includes(tab)
  ) {
    setTab("Dashboard");
  }
}, [userRole, tab]);

async function handleLogin() {
  setLoginError("");

  if (
    !loginEmail.trim() ||
    !loginPassword
  ) {
    setLoginError(
      "Email and password are required."
    );
    return;
  }

  setLoginLoading(true);

  const { error } =
    await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

  if (error) {
    console.error("Login error:", error);
    setLoginError(error.message);
    setLoginLoading(false);
    return;
  }

  setLoginPassword("");
  setLoginLoading(false);
}

async function handleLogout() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  setAuthUser(null);
  setUserRole(null);
  setLoginEmail("");
  setLoginPassword("");
  setTab("Dashboard");
}

 const [pointSystem, setPointSystem] =
  useState<"match" | "three_point">("match");

 const [tripDataVersion, setTripDataVersion] = useState(0);

 const [useHandicaps, setUseHandicaps] =
  useState(true);
 const [rounds, setRounds] = useState<any[]>([]);
 const [appMatches, setAppMatches] = useState<any[]>([]);
 const [selectedMatchId, setSelectedMatchId] =
  useState<string | null>(null);
 const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
useEffect(() => {
  async function loadHoles() {
    const { data, error } = await supabase
      .from("hole_information")
      .select("*")
      .order("hole_number", { ascending: true });

    if (error) {
      console.error("Error loading holes:", error);
      return;
    }

    setHoles(data || []);
  }

  loadHoles();
}, []);
useEffect(() => {
  async function loadTrips() {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error loading trips:",
        error
      );
      return;
    }

    const loadedTrips = data || [];

    setTrips(loadedTrips);

    if (loadedTrips.length === 0) {
  setSelectedTripId(null);
  setUseHandicaps(true);
  setPointSystem("match");
  return;
}

    const selectedTrip =
  loadedTrips.find(
    (trip) => trip.id === selectedTripId
  ) ?? loadedTrips[0];

setSelectedTripId(selectedTrip.id);

setUseHandicaps(
  selectedTrip.use_handicaps ?? true
);

setPointSystem(
  selectedTrip.point_system === "three_point"
    ? "three_point"
    : "match"
);

    const currentTrip = loadedTrips.find(
      (trip) => trip.id === selectedTripId
    );

    if (currentTrip) {
      setUseHandicaps(
        currentTrip.use_handicaps ?? true
      );
    } else {
      setUseHandicaps(
        loadedTrips[0].use_handicaps ?? true
      );
    }
  }

  loadTrips();
}, []);
useEffect(() => {
  async function loadPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select(`
        id,
        trip_id,
        team_id,
        first_name,
        last_name,
        email,
        handicap,
        created_at,
        teams (
          id,
          name,
          color
        )
      `)
      .order("last_name", { ascending: true });

    if (error) {
      console.error("Error loading players:", error);
      return;
    }

    setPlayers(data || []);
  }

  loadPlayers();
}, []);

useEffect(() => {
  async function loadTeams() {
    if (!selectedTripId) {
      setTeams([]);
      return;
    }

    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("trip_id", selectedTripId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading teams:", error);
      return;
    }

    setTeams(data || []);
  }

  loadTeams();
}, [selectedTripId]);

useEffect(() => {
  async function loadCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading courses:", error);
      return;
    }

    setCourses(data || []);
  }

  loadCourses();
}, []);

useEffect(() => {
  async function loadRounds() {
    if (!selectedTripId) {
      setRounds([]);
      return;
    }

    const { data, error } = await supabase
      .from("rounds")
      .select("*")
      .eq("trip_id", selectedTripId)
      .order("round_number", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading rounds:",
        error
      );
      return;
    }

    setRounds(data || []);
  }

  loadRounds();
}, [selectedTripId]);

useEffect(() => {
  async function loadMatches() {
    if (!selectedTripId) {
      setAppMatches([]);
      return;
    }

    const { data: tripRounds, error: roundError } =
      await supabase
        .from("rounds")
        .select("id")
        .eq("trip_id", selectedTripId);

    if (roundError) {
      console.error(
        "Error loading trip rounds:",
        roundError
      );
      return;
    }

    const roundIds =
      (tripRounds || []).map((round) => round.id);

    if (roundIds.length === 0) {
      setAppMatches([]);
      return;
    }

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .in("round_id", roundIds)
      .order("id", { ascending: true });

    if (error) {
      console.error(
        "Error loading matches:",
        error
      );
      return;
    }

    setAppMatches(data || []);
  }

  loadMatches();
}, [selectedTripId]);

useEffect(() => {
  async function loadTees() {
    const { data, error } = await supabase
      .from("course_tees")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading tees:", error);
      return;
    }

    setTees(data || []);
  }

  loadTees();
}, []);

 const nav = [
  { name: "Dashboard", icon: Home },
  { name: "Trips", icon: CalendarDays },
  { name: "Players", icon: Users },
  { name: "Teams", icon: Users },
  { name: "Courses", icon: Flag },
  { name: "Rounds", icon: Flag },
  { name: "Scorecards", icon: Trophy },
  { name: "Matches", icon: Trophy },
  { name: "Schedule", icon: CalendarDays },
  { name: "Settlements", icon: WalletCards },
  { name: "Notifications", icon: Bell },
  { name: "Settings", icon: Settings },
];

const visibleNav =
  userRole === "admin"
    ? nav
    : nav.filter((item) =>
        [
          "Dashboard",
          "Scorecards",
          "Matches",
          "Schedule",
          "Settlements",
          "Notifications",
        ].includes(item.name)
      );
 const send=()=>{setNotice("Notification sent to all players.");setTimeout(()=>setNotice(""),2500)};
 if (authLoading) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      Loading...
    </main>
  );
}

if (!authUser) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 24,
        }}
      >
        <h1>Lazy River Golf Club Clubhouse</h1>

        <p>
          Sign in to view the trip and enter scores.
        </p>

        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 20,
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) =>
              setLoginEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) =>
              setLoginPassword(e.target.value)
            }
          />

          {loginError && (
            <div className="error">
              {loginError}
            </div>
          )}

          <button
            className="primary"
            onClick={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </div>
      </div>
    </main>
  );
}
 return <div className="shell">
  <aside className={mobile?"side open":"side"}>
   <div className="brand"><div className="logo">⛳</div><div><b>Golf Trip</b><span>
  {trips.find(
    (trip) => trip.id === selectedTripId
  )?.name || "Golf Trip"}
</span></div><button className="close" onClick={()=>setMobile(false)}><X size={20}/></button></div>
   <nav>
     {visibleNav.map(({name, icon: I}) =>
    <button
      className={tab === name ? "nav active" : "nav"}
      onClick={() => {
        setTab(name);
        setMobile(false);
      }}
      key={name}
    >
      <I size={19}/>
      {name}
    </button>
  )}
</nav>
   <div className="sideBottom">
  <span>
    {userRole === "admin"
      ? "Admin Mode"
      : "Player Mode"}
  </span>


  <button
    className="link"
    onClick={handleLogout}
    style={{
      marginTop: 8,
      padding: 0,
    }}
  >
    Sign Out
  </button>
</div>
  </aside>
  {mobile&&<div className="shade" onClick={()=>setMobile(false)}/>}
  <main>
   <header><button className="hamb" onClick={()=>setMobile(true)}><Menu/></button><div><h1>{tab}</h1><p>
  {trips.find(
    (trip) => trip.id === selectedTripId
  )?.name || "Golf Trip"}
</p></div><div className="headerActions"><button className="icon"><Bell size={20}/></button><div className="avatar">JG</div></div></header>
   <select
  value={selectedTripId ?? ""}
  onChange={(e) => {
  const tripId = e.target.value || null;

  setSelectedTripId(tripId);

  const trip = trips.find((item) => item.id === tripId);

setUseHandicaps(trip?.use_handicaps ?? true);

setPointSystem(
  trip?.point_system === "three_point"
    ? "three_point"
    : "match"
);

setSelectedCourseId(null);
setSelectedMatchId(null);
setSelectedRoundId(null);
}}
>
  <option value="">
    Select trip...
  </option>

  {trips.map((trip) => (
    <option
      key={trip.id}
      value={trip.id}
    >
      {trip.name}
    </option>
  ))}
</select>
{userRole === "admin" && (
<label>
  Use Handicaps

  <select
    value={useHandicaps ? "on" : "off"}
    onChange={async (e) => {
      const enabled =
        e.target.value === "on";

      if (!selectedTripId) {
        return;
      }

      const previous =
        useHandicaps;

      setUseHandicaps(enabled);

      const { error } = await supabase
        .from("trips")
        .update({
          use_handicaps: enabled,
        })
        .eq("id", selectedTripId);

      if (error) {
        console.error(error);
        setUseHandicaps(previous);
        return;
      }

      setTrips((current) =>
        current.map((trip) =>
          trip.id === selectedTripId
            ? {
                ...trip,
                use_handicaps: enabled,
              }
            : trip
        )
      );
    }}
  >
    <option value="on">On</option>
    <option value="off">Off</option>
  </select>
</label>
)}
   {notice&&<div className="toast">✓ {notice}</div>}
   {tab === "Dashboard" && (
  <Dashboard
  send={send}
  players={players}
  rounds={rounds}
  matches={appMatches}
  teams={teams}
  trips={trips}
  selectedTripId={selectedTripId}
  pointSystem={pointSystem}
/>
)}
   {tab === "Players" && (
   <Players
  players={players}
  teams={teams}
  setPlayers={setPlayers}
  selectedTripId={selectedTripId}
/>
)}

{tab === "Teams" && (
  <Teams
    teams={teams}
    players={players}
    setTeams={setTeams}
    setPlayers={setPlayers}
    selectedTripId={selectedTripId}
  />
)}
{tab === "Courses" && (
  <Courses
    courses={courses}
    setCourses={setCourses}
    tees={tees}
    setTees={setTees}
    holes={holes}
    setHoles={setHoles}
    selectedCourseId={selectedCourseId}
    setSelectedCourseId={setSelectedCourseId}
  />
)}
{tab === "Trips" && (
  <TripsPage
    trips={trips}
    selectedTripId={selectedTripId}
    setSelectedTripId={setSelectedTripId}
    setTrips={setTrips}
    setUseHandicaps={setUseHandicaps}
    setPointSystem={setPointSystem}
  />
)}
   {tab === "Rounds" && (
  <Rounds
    rounds={rounds}
    courses={courses}
    tees={tees}
    players={players}
    tripId={selectedTripId || ""}
    setRounds={setRounds}
  />
)}
{tab === "Scorecards" && (
  <Scorecards
    rounds={rounds}
    courses={courses}
    players={players}
    tees={tees}
    holes={holes}
    selectedRoundId={selectedRoundId}
    setSelectedRoundId={setSelectedRoundId}
    useHandicaps={useHandicaps}
    selectedTripId={selectedTripId}
  />
)}

{tab === "Matches" && (
  <Matches
    matches={appMatches}
    rounds={rounds}
    courses={courses}
    players={players}
    setMatches={setAppMatches}
    selectedMatchId={selectedMatchId}
    setSelectedMatchId={setSelectedMatchId}
    useHandicaps={useHandicaps}
    pointSystem={pointSystem}
    userRole={userRole}
  />
)}

{tab === "Schedule" && (
  <Schedule
    rounds={rounds}
    courses={courses}
    selectedTripId={selectedTripId}
  />
)}

{tab === "Settlements" && (
  <Settlements
    players={players}
    selectedTripId={selectedTripId}
    tripDataVersion={tripDataVersion}
    userRole={userRole}
  />
)}

{tab === "Notifications" && (
  <Notifications
    selectedTripId={selectedTripId}
    userRole={userRole}
  />
)}

{tab === "Settings" && (
  <SettingsPage
  selectedTripId={selectedTripId}
  trips={trips}
  setTrips={setTrips}
  useHandicaps={useHandicaps}
  setUseHandicaps={setUseHandicaps}
  setPlayers={setPlayers}
  setRounds={setRounds}
  setMatches={setAppMatches}
  pointSystem={pointSystem}
setPointSystem={setPointSystem}
  onTripDataCleared={() =>
    setTripDataVersion((current) => current + 1)
  }
/>
)}
      </main>
    </div>
}

function Dashboard({
  send,
  players,
  rounds,
  matches,
  teams,
  trips,
  selectedTripId,
  pointSystem,
}: {
  send: () => void;
  players: Player[];
  rounds: any[];
  matches: any[];
  teams: any[];
  trips: any[];
  selectedTripId: string | null;
  pointSystem: "match" | "three_point";
}) {

  const selectedTrip = trips.find(
  (trip) => trip.id === selectedTripId
);

const tripStartDate = selectedTrip?.start_date
  ? new Date(`${selectedTrip.start_date}T00:00:00`)
  : null;

const [now, setNow] =
  useState(() => new Date());

useEffect(() => {
  const timer = window.setInterval(() => {
    setNow(new Date());
  }, 60000);

  return () =>
    window.clearInterval(timer);
}, []);

const countdownMs = tripStartDate
  ? Math.max(
      0,
      tripStartDate.getTime() - now.getTime()
    )
  : 0;

const countdownDays = Math.floor(
  countdownMs / (1000 * 60 * 60 * 24)
);

const countdownHours = Math.floor(
  (countdownMs / (1000 * 60 * 60)) % 24
);

const countdownMinutes = Math.floor(
  (countdownMs / (1000 * 60)) % 60
);
  
  const tripRounds = rounds.filter(
    (round) => round.trip_id === selectedTripId
  );

  const tripMatches = matches.filter((match) => {
    const round = tripRounds.find(
      (item) => item.id === match.round_id
    );

    return !!round;
  });

  const [tripPlayerIds, setTripPlayerIds] =
  useState<string[]>([]);

  useEffect(() => {
  async function loadTripPlayers() {
    if (!selectedTripId) {
      setTripPlayerIds([]);
      return;
    }

    const { data, error } = await supabase
      .from("trip_players")
      .select("player_id")
      .eq("trip_id", selectedTripId);

    if (error) {
      console.error(
        "Error loading dashboard trip players:",
        error
      );
      setTripPlayerIds([]);
      return;
    }

    setTripPlayerIds(
      (data || []).map(
        (row) => row.player_id
      )
    );
  }

  loadTripPlayers();
}, [selectedTripId]);

const [teamScores, setTeamScores] = useState<
  Record<string, number>
>({});

const [dashboardMatchPlayers, setDashboardMatchPlayers] =
  useState<Record<string, any[]>>({});

useEffect(() => {
  async function calculateTeamScores() {
    if (!selectedTripId) {
      setTeamScores({});
      return;
    }

    const { data: tripTeamPlayers, error: teamPlayerError } =
      await supabase
        .from("trip_players")
        .select("player_id, team_id")
        .eq("trip_id", selectedTripId);

    if (teamPlayerError) {
      console.error(
        "Error loading team assignments:",
        teamPlayerError
      );
      setTeamScores({});
      return;
    }

    const playerTeamMap: Record<string, string> = {};

    (tripTeamPlayers || []).forEach((row) => {
      if (row.team_id) {
        playerTeamMap[row.player_id] =
          row.team_id;
      }
    });

    const matchIds = tripMatches.map(
      (match) => match.id
    );

    if (matchIds.length === 0) {
      setTeamScores({});
      return;
    }

    const { data: matchPlayersData, error: matchPlayersError } =
      await supabase
        .from("match_players")
        .select("match_id, player_id, side")
        .in("match_id", matchIds);

    if (matchPlayersError) {
      console.error(
        "Error loading match players:",
        matchPlayersError
      );
      setTeamScores({});
      return;
    }

    const scores: Record<string, number> = {};

    for (const match of tripMatches) {
      const participants = (
        matchPlayersData || []
      ).filter(
        (player) =>
          player.match_id === match.id
      );

      const sideAPlayers = participants.filter(
        (player) => player.side === "A"
      );

      const sideBPlayers = participants.filter(
        (player) => player.side === "B"
      );

      const teamA =
        sideAPlayers.length > 0
          ? playerTeamMap[
              sideAPlayers[0].player_id
            ]
          : null;

      const teamB =
        sideBPlayers.length > 0
          ? playerTeamMap[
              sideBPlayers[0].player_id
            ]
          : null;

      if (teamA) {
        scores[teamA] =
          (scores[teamA] || 0) +
          Number(match.points_a || 0);
      }

      if (teamB) {
        scores[teamB] =
          (scores[teamB] || 0) +
          Number(match.points_b || 0);
      }
    }

    setTeamScores(scores);
  }

  calculateTeamScores();
}, [
  selectedTripId,
  matches,
  rounds,
]);

useEffect(() => {
  async function loadDashboardMatchPlayers() {
    if (tripMatches.length === 0) {
      setDashboardMatchPlayers({});
      return;
    }

    const matchIds = tripMatches.map(
      (match) => match.id
    );

    const { data, error } = await supabase
      .from("match_players")
      .select("match_id, player_id, side")
      .in("match_id", matchIds);

    if (error) {
      console.error(
        "Error loading dashboard match players:",
        error
      );
      setDashboardMatchPlayers({});
      return;
    }

    const grouped: Record<string, any[]> = {};

    (data || []).forEach((row) => {
      if (!grouped[row.match_id]) {
        grouped[row.match_id] = [];
      }

      grouped[row.match_id].push(row);
    });

    setDashboardMatchPlayers(grouped);
  }

  loadDashboardMatchPlayers();
}, [selectedTripId, matches, rounds]);

const tripPlayers = players.filter((player) =>
  tripPlayerIds.includes(player.id)
)

  const completedMatches = tripMatches.filter(
  (match) => {
    if (pointSystem === "three_point") {
      return (
        Number(match.points_a || 0) +
          Number(match.points_b || 0) >=
        3
      );
    }

    return (
      String(match.status || "")
        .toLowerCase()
        .includes("wins") ||
      String(match.status || "").toUpperCase() ===
        "AS"
    );
  }
).length;

  const liveMatches = tripMatches.filter((match) => {
  const status = String(
    match.status || ""
  ).toLowerCase();

  if (status.includes("scheduled")) {
    return false;
  }

  if (pointSystem === "three_point") {
    return (
      Number(match.points_a || 0) +
        Number(match.points_b || 0) <
      3
    );
  }

  return (
    !status.includes("wins") &&
    status !== "as"
  );
});

  return (
  <section>
    <div
      style={{
        marginBottom: 24,
        textAlign: "center",
      }}
    >
      <div
  className="eyebrow"
  style={{
    fontSize: 20,
    opacity: 2.1,
    letterSpacing: "0.18em",
  }}
>
  THE CLUBHOUSE
</div>

      <h1
        style={{
          margin: "6px 0 0",
          fontSize: "clamp(28px, 5vw, 44px)",
          lineHeight: 1.1,
        }}
      >
        Welcome Lazy River Golf Club
      </h1>
      {selectedTrip && (
  <div
    style={{
      marginTop: 18,
    }}
  >
    <div
      style={{
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 8,
      }}
    >
      {selectedTrip.name}
    </div>

    {tripStartDate && (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          fontSize: 16,
          opacity: 1.8,
        }}
      >
        <span>
          <strong>{countdownDays}</strong> DAYS
        </span>

        <span>•</span>

        <span>
          <strong>{countdownHours}</strong> HOURS
        </span>

        <span>•</span>

        <span>
          <strong>{countdownMinutes}</strong> MINUTES
        </span>
      </div>
    )}
  </div>
)}
    </div>

    <div className="hero">
        <div>
          <div className="eyebrow">
  LIVE COMPETITION
</div>

{(() => {
  const firstTeam = teams.find(
    (team) => team.trip_id === selectedTripId
  );

  const secondTeam = teams.find(
    (team) =>
      team.trip_id === selectedTripId &&
      team.id !== firstTeam?.id
  );

  const firstScore = firstTeam
    ? teamScores[firstTeam.id] || 0
    : 0;

  const secondScore = secondTeam
    ? teamScores[secondTeam.id] || 0
    : 0;

  let headline = "Set up the competition";

  if (firstTeam && secondTeam) {
    if (firstScore > secondScore) {
      headline = `${firstTeam.name} leads ${secondTeam.name}`;
    } else if (secondScore > firstScore) {
      headline = `${secondTeam.name} leads ${firstTeam.name}`;
    } else {
      headline = `${firstTeam.name} and ${secondTeam.name} are tied`;
    }
  }

  return <h2>{headline}</h2>;
})()}

<p>
  Keep the trip moving from one command center.
</p>
        </div>

        <button
          className="primary"
          onClick={send}
        >
          <Bell size={17} />
          Send update
        </button>
      </div>

      <div className="scoreboard">
  {(() => {
    const firstTeam = teams.find(
      (team) =>
        team.trip_id === selectedTripId
    );

    const secondTeam = teams.find(
      (team) =>
        team.trip_id === selectedTripId &&
        team.id !== firstTeam?.id
    );

    return (
      <>
        <div>
          <span>
            {firstTeam?.name || "Team 1"}
          </span>

          <b>
            {firstTeam
              ? teamScores[firstTeam.id] || 0
              : 0}
          </b>
        </div>

        <div className="vs">
          VS
        </div>

        <div>
          <span>
            {secondTeam?.name || "Team 2"}
          </span>

          <b>
            {secondTeam
              ? teamScores[secondTeam.id] || 0
              : 0}
          </b>
        </div>
      </>
    );
  })()}
</div>

      <div className="grid4">
        {[
          [String(tripPlayers.length), "Players"],
          [String(tripRounds.length), "Rounds"],
          [String(tripMatches.length), "Matches"],
          [String(completedMatches), "Complete"],
        ].map((item) => (
          <div
            className="stat"
            key={item[1]}
          >
            <b>{item[0]}</b>
            <span>{item[1]}</span>
          </div>
        ))}
      </div>

      <div className="two">
        <Card title="Live matches">
          <div className="list">
            {liveMatches.length === 0 ? (
  <p>No live matches.</p>
) : (
  liveMatches.map((match) => {
    const participants =
  dashboardMatchPlayers[match.id] || [];

const sideAPlayers = participants
  .filter((player) => player.side === "A")
  .map((player) =>
    players.find(
      (item) => item.id === player.player_id
    )
  )
  .filter(Boolean);

const sideBPlayers = participants
  .filter((player) => player.side === "B")
  .map((player) =>
    players.find(
      (item) => item.id === player.player_id
    )
  )
  .filter(Boolean);

const playerAName =
  sideAPlayers.length > 0
    ? sideAPlayers
        .map(
          (player: any) =>
            `${player.first_name} ${player.last_name}`
        )
        .join(" & ")
    : "Side A";

const playerBName =
  sideBPlayers.length > 0
    ? sideBPlayers
        .map(
          (player: any) =>
            `${player.first_name} ${player.last_name}`
        )
        .join(" & ")
    : "Side B";

    return (
      <div
        className="row"
        key={match.id}
      >
        <div>
          <b>{playerAName}</b>

          <span>
            vs {playerBName}
          </span>
        </div>

        <strong className="live">
          {match.status}
        </strong>
      </div>
    );
  })
)}
          </div>

          <button className="link">
            View all matches
            <ChevronRight size={15} />
          </button>
        </Card>

        <Card title="Needs attention">
          <div className="attention">
            {tripPlayers.some(
              (player) =>
                player.handicap === null
            ) && (
              <p>
                ⚠ Some players are missing
                handicaps
              </p>
            )}

            <p>
              ✓ Trip data is synced
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
function Card(p:any){return <div className="card"><div className="cardHead"><h3>{p.title}</h3><ChevronRight size={17}/></div>{p.children}</div>}
function Players({
  players,
  teams,
  setPlayers,
  selectedTripId,
}: {
  players: Player[];
  teams: Team[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  selectedTripId: string | null;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingPlayerId, setEditingPlayerId] =
  useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [handicap, setHandicap] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [tripPlayerMap, setTripPlayerMap] = useState<
  Record<string, any>
>({});

useEffect(() => {
  async function loadTripPlayers() {
    if (!selectedTripId) {
      setTripPlayerMap({});
      return;
    }

    const { data, error } = await supabase
      .from("trip_players")
      .select(`
        player_id,
        team_id,
        teams (
          id,
          name,
          color
        )
      `)
      .eq("trip_id", selectedTripId);

    if (error) {
      console.error(
        "Error loading trip player assignments:",
        error
      );
      setTripPlayerMap({});
      return;
    }

    const map: Record<string, any> = {};

    (data || []).forEach((row) => {
      map[row.player_id] = row;
    });

    setTripPlayerMap(map);
  }

  loadTripPlayers();
}, [selectedTripId]);

  async function addPlayer() {
  setErrorMessage("");
  setError(false);

  if (!firstName.trim() || !lastName.trim()) {
    setErrorMessage("First name and last name are required.");
    setError(true);
    return;
  }

  const parsedHandicap =
    handicap.trim() === ""
      ? null
      : Number(handicap);

  if (
    parsedHandicap !== null &&
    Number.isNaN(parsedHandicap)
  ) {
    setErrorMessage("Handicap must be a valid number.");
    setError(true);
    return;
  }

  setSaving(true);

  const playerData = {
  first_name: firstName.trim(),
  last_name: lastName.trim(),
  email: email.trim() || null,
  handicap: parsedHandicap,
};


const { data, error: insertError } =
  editingPlayerId
    ? await supabase
        .from("players")
        .update(playerData)
        .eq("id", editingPlayerId)
        .select(`
          id,
          trip_id,
          team_id,
          first_name,
          last_name,
          email,
          handicap,
          created_at,
          teams (
            id,
            name,
            color
          )
        `)
        .single()
    : await supabase
        .from("players")
        .insert(playerData)
        .select(`
          id,
          trip_id,
          team_id,
          first_name,
          last_name,
          email,
          handicap,
          created_at,
          teams (
            id,
            name,
            color
          )
        `)
        .single();

  if (insertError) {
  console.error(
  "Error adding/updating player:",
  insertError
);

  setErrorMessage(insertError.message);
    setError(true);
    setSaving(false);
    return;
  }

  setPlayers((current) =>
  (
    editingPlayerId
      ? current.map((player) =>
          player.id === editingPlayerId
            ? data
            : player
        )
      : [...current, data]
  ).sort((a, b) =>
    `${a.last_name} ${a.first_name}`.localeCompare(
      `${b.last_name} ${b.first_name}`
    )
  )
);

  setFirstName("");
  setLastName("");
  setEmail("");
  setHandicap("");
  setErrorMessage("");
  setError(false);
  setSaving(false);
  setEditingPlayerId(null);
  setShowForm(false);
}

  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Players</h2>
          <p>Handicaps, teams and current trip performance.</p>
        </div>

        <button
          className="primary"
          onClick={() => {
  setEditingPlayerId(null);
  setFirstName("");
  setLastName("");
  setEmail("");
  setHandicap("");
  setErrorMessage("");
  setError(false);
  setShowForm(true);
}}
        >
          <Plus size={17} /> Add player
        </button>
      </div>

      {showForm && (
        <div className="card compose">
          <div className="cardHead">
            <h3>
  {editingPlayerId
    ? "Edit Player"
    : "Add Player"}
</h3>

            <button
              className="icon"
              onClick={() => {
  setEditingPlayerId(null);
  setFirstName("");
  setLastName("");
  setEmail("");
  setHandicap("");
  setErrorMessage("");
  setError(false);
  setShowForm(false);
}}
            >
              <X size={18} />
            </button>
          </div>

          <label>
            First Name
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Mike"
            />
          </label>

          <label>
            Last Name
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Johnson"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mike@example.com"
            />
          </label>

          <label>
            Handicap
            <input
              type="number"
              step="0.1"
              min="0"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              placeholder="8.4"
            />
          </label>

          {errorMessage && (
            <div className="attention">
              <p>⚠ {errorMessage}</p>
            </div>
          )}

          <button
            className="primary"
            onClick={addPlayer}
            disabled={saving}
          >
            {saving
  ? "Saving..."
  : editingPlayerId
    ? "Update Player"
    : "Add Player"}
          </button>
        </div>
      )}

      <div className="card tableWrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Handicap</th>
              <th>Team</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
  {players.map((player) => (
    <tr key={player.id}>
      <td>
        <b>
          {player.first_name} {player.last_name}
        </b>
      </td>

      <td>
        {player.handicap ?? "—"}
      </td>

      <td>
  {tripPlayerMap[player.id]?.teams?.name ? (
    <span
      className={
        "pill " +
        (
          tripPlayerMap[player.id].teams.name ===
          "Team USA"
            ? "usa"
            : "eur"
        )
      }
    >
      {tripPlayerMap[player.id].teams.name}
    </span>
  ) : selectedTripId &&
    tripPlayerMap[player.id] ? (
    <span className="pill">
      Unassigned
    </span>
  ) : (
    <span className="pill">
      Not in trip
    </span>
  )}
</td>

      <td>
        {player.email ?? "—"}
      </td>

      <td>
  <div
    style={{
      display: "flex",
      gap: 12,
      alignItems: "center",
    }}
  >

        <button
  className="link"
  onClick={() => {
    setEditingPlayerId(player.id);

    setFirstName(player.first_name || "");
    setLastName(player.last_name || "");
    setEmail(player.email || "");

    setHandicap(
      player.handicap != null
        ? String(player.handicap)
        : ""
    );

    setShowForm(true);
  }}
>
  Edit
</button>
        <button
          className="link"
          onClick={() =>
            deletePlayer(player.id)
          }
        >
          Delete
        </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </section>
  );
  async function deletePlayer(
  playerId: string
) {
  const player = players.find(
    (item) => item.id === playerId
  );

  if (!player) {
    return;
  }

  const { data: tripAssignments, error: tripLookupError } =
  await supabase
    .from("trip_players")
    .select(`
      id,
      trip_id,
      trips (
        id,
        name
      )
    `)
    .eq("player_id", playerId);

if (tripLookupError) {
  console.error(
    "Error checking trip assignments:",
    tripLookupError
  );

  setErrorMessage(
    tripLookupError.message
  );
  return;
}

if (tripAssignments && tripAssignments.length > 0) {
  const tripNames = tripAssignments
    .map((assignment: any) =>
      assignment.trips?.name
    )
    .filter(Boolean)
    .join(", ");

  setErrorMessage(
    `Cannot delete this player because they are assigned to ${tripAssignments.length} trip${
      tripAssignments.length === 1 ? "" : "s"
    }${tripNames ? `: ${tripNames}` : ""}. Remove the player from the trip first.`
  );

  return;
}

  const playerFullName =
    `${player.first_name} ${player.last_name}`;

  const confirmed = window.confirm(
    `Delete ${playerFullName}?\n\n` +
    `This permanently deletes the global player record and any remaining matches, scores, and handicap records associated with this player.`
  );

  if (!confirmed) {
    return;
  }

  setErrorMessage("");
  setSaving(true);

  try {
    // Find matches involving this player.
    const {
      data: relatedMatches,
      error: matchLookupError,
    } = await supabase
      .from("matches")
      .select("id")
      .or(
        `player_a.eq.${playerId},player_b.eq.${playerId}`
      );

    if (matchLookupError) {
      throw matchLookupError;
    }

    const matchIds =
      relatedMatches?.map(
        (match) => match.id
      ) || [];

    // Delete all dependent records for
    // matches involving this player.
    if (matchIds.length > 0) {
      const {
        error: holeResultError,
      } = await supabase
        .from("match_hole_results")
        .delete()
        .in("match_id", matchIds);

      if (holeResultError) {
        throw holeResultError;
      }

      const {
        error: sideScoreError,
      } = await supabase
        .from("match_side_hole_scores")
        .delete()
        .in("match_id", matchIds);

      if (sideScoreError) {
        throw sideScoreError;
      }

      const {
        error: sideHandicapError,
      } = await supabase
        .from("match_side_handicaps")
        .delete()
        .in("match_id", matchIds);

      if (sideHandicapError) {
        throw sideHandicapError;
      }

      const {
        error: matchHandicapError,
      } = await supabase
        .from("match_player_handicaps")
        .delete()
        .in("match_id", matchIds);

      if (matchHandicapError) {
        throw matchHandicapError;
      }

      const {
        error: matchPlayersError,
      } = await supabase
        .from("match_players")
        .delete()
        .in("match_id", matchIds);

      if (matchPlayersError) {
        throw matchPlayersError;
      }

      const {
        error: matchDeleteError,
      } = await supabase
        .from("matches")
        .delete()
        .in("id", matchIds);

      if (matchDeleteError) {
        throw matchDeleteError;
      }
    }

    // Remove individual round scores.
    const {
      error: scoreError,
    } = await supabase
      .from("round_scores")
      .delete()
      .eq("player_id", playerId);

    if (scoreError) {
      throw scoreError;
    }

    // Remove round handicap records.
    const {
      error: roundHandicapError,
    } = await supabase
      .from("round_player_handicaps")
      .delete()
      .eq("player_id", playerId);

    if (roundHandicapError) {
      throw roundHandicapError;
    }

    // Remove any remaining player-specific
    // match handicap records.
    const {
      error: playerHandicapError,
    } = await supabase
      .from("match_player_handicaps")
      .delete()
      .eq("player_id", playerId);

    if (playerHandicapError) {
      throw playerHandicapError;
    }

    // Finally delete the player.
    const {
      error: playerDeleteError,
    } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);

    if (playerDeleteError) {
      throw playerDeleteError;
    }

    setPlayers((current) =>
      current.filter(
        (item) => item.id !== playerId
      )
    );

    setErrorMessage("");

  } catch (error: any) {
    console.error(
      "Error deleting player:",
      error
    );

    setErrorMessage(
      error?.message ||
        "Unable to delete player."
    );
  } finally {
    setSaving(false);
  }
}
}

function Teams({
  teams,
  players,
  setTeams,
  setPlayers,
  selectedTripId,
}: {
  teams: any[];
  players: any[];
  setTeams: React.Dispatch<React.SetStateAction<any[]>>;
  setPlayers: React.Dispatch<React.SetStateAction<any[]>>;
  selectedTripId: string | null;
}) {
  const [tripPlayers, setTripPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamColor, setNewTeamColor] = useState("#2563eb");
  const [teamError, setTeamError] = useState("");

  const tripTeams = teams.filter(
    (team) => team.trip_id === selectedTripId
  );

  useEffect(() => {
    async function loadTripPlayers() {
      if (!selectedTripId) {
        setTripPlayers([]);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("trip_players")
        .select(`
          id,
          trip_id,
          player_id,
          team_id,
          players (
            id,
            first_name,
            last_name,
            email,
            handicap
          ),
          teams (
            id,
            name,
            color
          )
        `)
        .eq("trip_id", selectedTripId);

      if (error) {
        console.error("Error loading trip players:", error);
        setTeamError(error.message);
        setLoading(false);
        return;
      }

      setTripPlayers(data || []);
      setTeamError("");
      setLoading(false);
    }

    loadTripPlayers();
  }, [selectedTripId]);

  async function refreshTripPlayers() {
    if (!selectedTripId) {
      setTripPlayers([]);
      return;
    }

    const { data, error } = await supabase
      .from("trip_players")
      .select(`
        id,
        trip_id,
        player_id,
        team_id,
        players (
          id,
          first_name,
          last_name,
          email,
          handicap
        ),
        teams (
          id,
          name,
          color
        )
      `)
      .eq("trip_id", selectedTripId);

    if (error) {
      console.error("Error refreshing trip players:", error);
      setTeamError(error.message);
      return;
    }

    setTripPlayers(data || []);
  }

  async function createTeam() {
    setTeamError("");

    if (!selectedTripId) {
      setTeamError("Select a trip first.");
      return;
    }

    if (!newTeamName.trim()) {
      setTeamError("Team name is required.");
      return;
    }

    const { data, error } = await supabase
      .from("teams")
      .insert({
        trip_id: selectedTripId,
        name: newTeamName.trim(),
        color: newTeamColor,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating team:", error);
      setTeamError(error.message);
      return;
    }

    setTeams((current) => [...current, data]);
    setNewTeamName("");
  }

  async function addPlayerToTrip(playerId: string) {
    if (!selectedTripId) {
      setTeamError("Select a trip first.");
      return;
    }

    setTeamError("");

    const { error } = await supabase
      .from("trip_players")
      .insert({
        trip_id: selectedTripId,
        player_id: playerId,
        team_id: null,
      });

    if (error) {
      console.error("Error adding player to trip:", error);
      setTeamError(error.message);
      return;
    }

    await refreshTripPlayers();
  }

  async function removePlayerFromTrip(tripPlayerId: string) {
    setTeamError("");

    const { error } = await supabase
      .from("trip_players")
      .delete()
      .eq("id", tripPlayerId);

    if (error) {
      console.error("Error removing player from trip:", error);
      setTeamError(error.message);
      return;
    }

    setTripPlayers((current) =>
      current.filter((item) => item.id !== tripPlayerId)
    );
  }

  async function assignPlayerToTeam(
    tripPlayerId: string,
    teamId: string
  ) {
    setTeamError("");

    const { error } = await supabase
      .from("trip_players")
      .update({
        team_id: teamId || null,
      })
      .eq("id", tripPlayerId);

    if (error) {
      console.error("Error assigning team:", error);
      setTeamError(error.message);
      return;
    }

    await refreshTripPlayers();
  }

  async function deleteTeam(teamId: string) {
    const confirmed = window.confirm(
      "Delete this team? Players will remain in the trip but become unassigned."
    );

    if (!confirmed) {
      return;
    }

    setTeamError("");

    const { error: clearError } = await supabase
      .from("trip_players")
      .update({ team_id: null })
      .eq("team_id", teamId);

    if (clearError) {
      console.error("Error clearing team assignments:", clearError);
      setTeamError(clearError.message);
      return;
    }

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", teamId);

    if (error) {
      console.error("Error deleting team:", error);
      setTeamError(error.message);
      return;
    }

    setTeams((current) =>
      current.filter((team) => team.id !== teamId)
    );

    await refreshTripPlayers();
  }

  if (!selectedTripId) {
    return (
      <div className="card">
        <div className="cardHead">
          <div>
            <h3>Teams</h3>
            <p>Select a trip to manage its teams and players.</p>
          </div>
        </div>
      </div>
    );
  }

  const assignedPlayerIds = new Set(
    tripPlayers.map((item) => item.player_id)
  );

  const availablePlayers = players.filter(
    (player) => !assignedPlayerIds.has(player.id)
  );

  return (
    <div>
      <div className="card">
        <div className="cardHead">
          <div>
            <h3>Create Team</h3>
            <p>
              Teams belong to the selected trip. Players remain global.
            </p>
          </div>
        </div>

        <div className="formGrid">
          <label>
            Team Name
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="USA"
            />
          </label>

          <label>
            Team Color
            <input
              type="color"
              value={newTeamColor}
              onChange={(e) => setNewTeamColor(e.target.value)}
            />
          </label>
        </div>

        <button className="primary" onClick={createTeam}>
          + Create Team
        </button>

        {teamError && (
          <div className="attention">
            <p>⚠ {teamError}</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="cardHead">
          <div>
            <h3>Add Players To This Trip</h3>
            <p>These players are available globally.</p>
          </div>
        </div>

        {availablePlayers.length === 0 ? (
          <p>
            All global players are already assigned to this trip.
          </p>
        ) : (
          <div>
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className="row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "10px 0",
                }}
              >
                <div>
                  <strong>
                    {player.first_name} {player.last_name}
                  </strong>
                  <div>
                    HCP{" "}
                    {player.handicap ?? "—"}
                  </div>
                </div>

                <button
                  className="primary"
                  onClick={() => addPlayerToTrip(player.id)}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="cardHead">
          <div>
            <h3>Trip Players</h3>
            <p>
              {tripPlayers.length} player
              {tripPlayers.length === 1 ? "" : "s"} in this trip.
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading players...</p>
        ) : tripPlayers.length === 0 ? (
          <p>No players have been added to this trip yet.</p>
        ) : (
          <div>
            {tripPlayers.map((item) => {
              const player = item.players;

              return (
                <div
                  key={item.id}
                  className="row"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
  "minmax(0, 1fr) minmax(110px, 150px) auto",
                    gap: "12px",
                    alignItems: "center",
                    padding: "12px 0",
                  }}
                >
                  <div>
                    <strong>
                      {player?.first_name} {player?.last_name}
                    </strong>

                    <div>
                      HCP{" "}
                      {player?.handicap ?? "—"}
                    </div>
                  </div>

                  <select
                    value={item.team_id || ""}
                    onChange={(e) =>
                      assignPlayerToTeam(
                        item.id,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {tripTeams.map((team) => (
                      <option
                        key={team.id}
                        value={team.id}
                      >
                        {team.name}
                      </option>
                    ))}
                  </select>

                  <button
                    className="danger"
                    onClick={() =>
                      removePlayerFromTrip(item.id)
                    }
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="cardHead">
          <div>
            <h3>Teams For This Trip</h3>
            <p>
              {tripTeams.length} team
              {tripTeams.length === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        {tripTeams.length === 0 ? (
          <p>No teams created for this trip yet.</p>
        ) : (
          <div>
            {tripTeams.map((team) => {
              const roster = tripPlayers.filter(
                (item) => item.team_id === team.id
              );

              return (
                <div
                  key={team.id}
                  className="card"
                  style={{
                    marginBottom: "12px",
                  }}
                >
                  <div
                    className="cardHead"
                    style={{
                      borderBottom: "0",
                    }}
                  >
                    <div>
                      <h3>
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background:
                              team.color || "#2563eb",
                            marginRight: "8px",
                          }}
                        />
                        {team.name}
                      </h3>

                      <p>
                        {roster.length} player
                        {roster.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <button
                      className="danger"
                      onClick={() =>
                        deleteTeam(team.id)
                      }
                    >
                      Delete Team
                    </button>
                  </div>

                  {roster.length === 0 ? (
                    <p>No players assigned.</p>
                  ) : (
                    <div>
                      {roster.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            padding: "6px 0",
                          }}
                        >
                          {item.players?.first_name}{" "}
                          {item.players?.last_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
function TripsPage({
  trips,
  selectedTripId,
  setSelectedTripId,
  setTrips,
  setUseHandicaps,
  setPointSystem,
}: {
  trips: any[];
  selectedTripId: string | null;
  setSelectedTripId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  setTrips: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  setUseHandicaps: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  setPointSystem: React.Dispatch<
  React.SetStateAction<
    "match" | "three_point"
  >
>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [tripName, setTripName] = useState("");
  const [useHandicaps, setLocalUseHandicaps] =
    useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function createTrip() {
    setMessage("");

    if (!tripName.trim()) {
      setMessage("Trip name is required.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("trips")
      .insert({
        name: tripName.trim(),
        use_handicaps: useHandicaps,
      })
      .select("*")
      .single();

    if (error) {
  console.error("Error creating trip:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  setMessage(
    error.message ||
      "Unable to create trip."
  );

  setSaving(false);
  return;
}

    setTrips((current) =>
      [...current, data].sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || ""
        )
      )
    );

    setSelectedTripId(data.id);

setUseHandicaps(
  data.use_handicaps ?? true
);

setPointSystem(
  data.point_system === "three_point"
    ? "three_point"
    : "match"
);

    setTripName("");
    setLocalUseHandicaps(true);
    setShowForm(false);
    setSaving(false);
    setMessage("Trip created successfully.");
  }

  async function deleteTrip(
    tripId: string
  ) {
    const trip = trips.find(
      (item) => item.id === tripId
    );

    if (!trip) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${trip.name}?\n\n` +
      `This will permanently delete the trip and all trip-specific data, including rounds, matches, scores, expenses, settlements, and player assignments.\n\n` +
      `Global players, courses, tees, and hole information will NOT be deleted.`
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      /*
       * Clear all competition data first.
       * This preserves global players and course data.
       */
      const { error: clearError } =
        await supabase.rpc(
          "clear_trip_data",
          {
            target_trip_id: tripId,
          }
        );

      if (clearError) {
        throw clearError;
      }

      /*
       * Now delete the trip itself.
       */
      const { error: deleteError } =
        await supabase
          .from("trips")
          .delete()
          .eq("id", tripId);

      if (deleteError) {
        throw deleteError;
      }

      setTrips((current) =>
        current.filter(
          (item) => item.id !== tripId
        )
      );

      if (selectedTripId === tripId) {
        setSelectedTripId(null);
        setUseHandicaps(true);
      }

      setMessage(
        "Trip deleted successfully."
      );
    } catch (error: any) {
      console.error(
        "Error deleting trip:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to delete trip."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Trips</h2>

          <p>
            Create and manage your golf
            competitions.
          </p>
        </div>

        <button
          className="primary"
          onClick={() =>
            setShowForm(true)
          }
        >
          <Plus size={17} />
          Create trip
        </button>
      </div>

      {showForm && (
        <div className="card compose">
          <div className="cardHead">
            <h3>Create Trip</h3>

            <button
              className="icon"
              onClick={() =>
                setShowForm(false)
              }
            >
              <X size={18} />
            </button>
          </div>

          <label>
            Trip name

            <input
              value={tripName}
              onChange={(e) =>
                setTripName(
                  e.target.value
                )
              }
              placeholder="Scottsdale Cup 2026"
            />
          </label>

          <label>
            Handicap scoring

            <select
              value={
                useHandicaps
                  ? "on"
                  : "off"
              }
              onChange={(e) =>
                setLocalUseHandicaps(
                  e.target.value === "on"
                )
              }
            >
              <option value="on">
                On
              </option>

              <option value="off">
                Off
              </option>
            </select>
          </label>

          {message && (
            <div className="attention">
              <p>{message}</p>
            </div>
          )}

          <button
            className="primary"
            onClick={createTrip}
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Trip"}
          </button>
        </div>
      )}

      {message && !showForm && (
        <div
          className="attention"
          style={{
            marginBottom: "12px",
          }}
        >
          <p>{message}</p>
        </div>
      )}

      <div className="card tableWrap">
        <table>
          <thead>
            <tr>
              <th>Trip</th>
              <th>Handicaps</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  No trips created yet.
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    <b>{trip.name}</b>
                  </td>

                  <td>
                    {trip.use_handicaps
                      ? "On"
                      : "Off"}
                  </td>

                  <td>
                    {trip.id ===
                    selectedTripId ? (
                      <span className="pill usa">
                        Selected
                      </span>
                    ) : (
                      <span className="pill">
                        Available
                      </span>
                    )}
                  </td>

                  <td>
                    {trip.id !==
                      selectedTripId && (
                      <button
                        className="link"
                        onClick={() => {
                          setSelectedTripId(
                            trip.id
                          );
                          setUseHandicaps(
                            trip.use_handicaps ??
                              true
                          );
                        }}
                        disabled={saving}
                      >
                        Select
                      </button>
                    )}

                    <button
                      className="link"
                      onClick={() =>
                        deleteTrip(
                          trip.id
                        )
                      }
                      disabled={saving}
                      style={{
                        marginLeft:
                          "12px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Courses({
  courses,
  setCourses,
  tees,
  setTees,
  holes,
  setHoles,
  selectedCourseId,
  setSelectedCourseId,
}: {
  courses: any[];
  setCourses: React.Dispatch<React.SetStateAction<any[]>>;
  tees: Tee[];
  setTees: React.Dispatch<React.SetStateAction<Tee[]>>;
  holes: Hole[];
  setHoles: React.Dispatch<React.SetStateAction<Hole[]>>;
  selectedCourseId: string | null;
  setSelectedCourseId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
}) {
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [holeCount, setHoleCount] = useState("18");

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [showTeeForm, setShowTeeForm] = useState(false);
  const [editingTeeId, setEditingTeeId] = useState<string | null>(null);
  const [teeName, setTeeName] = useState("");
  const [teeColor, setTeeColor] = useState("");
  const [teeYardage, setTeeYardage] = useState("");
  const [teePar, setTeePar] = useState("72");
  const [teeRating, setTeeRating] = useState("");
  const [teeSlope, setTeeSlope] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [holeSaveMessage, setHoleSaveMessage] = useState("");

  // Draft hole data is kept separate from the data loaded from Supabase.
  const [draftHoles, setDraftHoles] = useState<Hole[]>([]);

  const selectedCourse = courses.find(
    (course) => course.id === selectedCourseId
  );

  const courseTees = tees.filter(
    (tee) => tee.course_id === selectedCourseId
  );

  // Load the selected course's saved holes into the editable draft.
  useEffect(() => {
    if (!selectedCourseId || !selectedCourse) {
      setDraftHoles([]);
      return;
    }

    const numberOfHoles = Number(selectedCourse.holes) || 18;

    const savedHoles = holes
      .filter((hole) => hole.course_id === selectedCourseId)
      .sort((a, b) => a.hole_number - b.hole_number);

    const rows: Hole[] = Array.from(
      { length: numberOfHoles },
      (_, index) => {
        const holeNumber = index + 1;

        const savedHole = savedHoles.find(
          (hole) => hole.hole_number === holeNumber
        );

        return (
          savedHole || {
            course_id: selectedCourseId,
            hole_number: holeNumber,
            par: 4,
            yardage: null,
            handicap_rank: holeNumber,
          }
        );
      }
    );

    setDraftHoles(rows);
    setHoleSaveMessage("");
  }, [selectedCourseId, selectedCourse, holes]);

  function updateDraftHole(
    holeNumber: number,
    field: "par" | "yardage" | "handicap_rank",
    value: string
  ) {
    setDraftHoles((current) =>
      current.map((hole) => {
        if (hole.hole_number !== holeNumber) {
          return hole;
        }

        if (value === "") {
          return {
            ...hole,
            [field]: field === "par" ? 4 : null,
          };
        }

        return {
          ...hole,
          [field]: Number(value),
        };
      })
    );

    setHoleSaveMessage("");
  }

  function validateHoles(): string | null {
    if (!selectedCourse) {
      return "Please select a course.";
    }

    const numberOfHoles =
      Number(selectedCourse.holes) || 18;

    if (draftHoles.length !== numberOfHoles) {
      return `This course requires ${numberOfHoles} holes.`;
    }

    if (
      draftHoles.some(
        (hole) =>
          hole.par < 3 ||
          hole.par > 6
      )
    ) {
      return "Par must be between 3 and 6.";
    }

    if (
      draftHoles.some(
        (hole) =>
          hole.yardage === null ||
          hole.yardage <= 0
      )
    ) {
      return "Every hole needs a yardage.";
    }

    if (
      draftHoles.some(
        (hole) =>
          hole.handicap_rank === null ||
          hole.handicap_rank < 1 ||
          hole.handicap_rank > numberOfHoles
      )
    ) {
      return `Handicap ranks must be between 1 and ${numberOfHoles}.`;
    }

    const ranks = draftHoles.map(
      (hole) => hole.handicap_rank
    );

    const uniqueRanks = new Set(ranks);

    if (uniqueRanks.size !== numberOfHoles) {
      return `Handicap ranks must be unique from 1 through ${numberOfHoles}.`;
    }

    return null;
  }

  async function saveHoles() {
    if (!selectedCourseId) {
      return;
    }

    const validationError = validateHoles();

    if (validationError) {
      setHoleSaveMessage(`⚠ ${validationError}`);
      return;
    }

    setHoleSaveMessage("");
    setSaving(true);

    const { error: deleteError } = await supabase
      .from("hole_information")
      .delete()
      .eq("course_id", selectedCourseId);

    if (deleteError) {
      console.error(deleteError);
      setHoleSaveMessage(
        `Could not save holes: ${deleteError.message}`
      );
      setSaving(false);
      return;
    }

    const rows = draftHoles.map((hole) => ({
      course_id: selectedCourseId,
      hole_number: hole.hole_number,
      par: hole.par,
      yardage: hole.yardage,
      handicap_rank: hole.handicap_rank,
    }));

    const { data, error } = await supabase
      .from("hole_information")
      .insert(rows)
      .select("*");

    if (error) {
      console.error(error);
      setHoleSaveMessage(
        `Could not save holes: ${error.message}`
      );
      setSaving(false);
      return;
    }

    const savedData = data || [];

    // Update the real saved state only after Supabase succeeds.
    setHoles((current) => [
      ...current.filter(
        (hole) => hole.course_id !== selectedCourseId
      ),
      ...savedData,
    ]);

    // Reset the draft from the successful database result.
    setDraftHoles(
      [...savedData].sort(
        (a, b) => a.hole_number - b.hole_number
      )
    );

    setHoleSaveMessage(
      "✓ All holes saved successfully."
    );

    setSaving(false);
  }

  function cancelHoleChanges() {
    if (!selectedCourseId || !selectedCourse) {
      return;
    }

    const numberOfHoles =
      Number(selectedCourse.holes) || 18;

    const savedHoles = holes
      .filter((hole) => hole.course_id === selectedCourseId)
      .sort((a, b) => a.hole_number - b.hole_number);

    const rows: Hole[] = Array.from(
      { length: numberOfHoles },
      (_, index) => {
        const holeNumber = index + 1;

        return (
          savedHoles.find(
            (hole) => hole.hole_number === holeNumber
          ) || {
            course_id: selectedCourseId,
            hole_number: holeNumber,
            par: 4,
            yardage: null,
            handicap_rank: holeNumber,
          }
        );
      }
    );

    setDraftHoles(rows);
    setHoleSaveMessage("Changes discarded.");
  }

  async function createCourse() {
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Course name is required.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("courses")
      .insert({
        name: name.trim(),
        location: location.trim() || null,
        holes: Number(holeCount),
      })
      .select("*")
      .single();

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setCourses((current) =>
      [...current, data].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    setName("");
    setLocation("");
    setHoleCount("18");
    setShowForm(false);
    setSaving(false);
  }
  async function updateCourse() {
  if (!editingCourseId) {
    return;
  }

  setErrorMessage("");

  if (!name.trim()) {
    setErrorMessage("Course name is required.");
    return;
  }

  setSaving(true);

  const { data, error } = await supabase
    .from("courses")
    .update({
      name: name.trim(),
      location: location.trim() || null,
      holes: Number(holeCount),
    })
    .eq("id", editingCourseId)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    setErrorMessage(error.message);
    setSaving(false);
    return;
  }

  setCourses((current) =>
    current.map((course) =>
      course.id === editingCourseId
        ? data
        : course
    )
  );

  setEditingCourseId(null);
  setShowForm(false);
  setName("");
  setLocation("");
  setHoleCount("18");
  setSaving(false);
}

  async function createTee() {
    setErrorMessage("");

    if (!selectedCourseId) {
      setErrorMessage("Please select a course first.");
      return;
    }

    if (!teeName.trim()) {
      setErrorMessage("Tee name is required.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("course_tees")
      .insert({
        course_id: selectedCourseId,
        name: teeName.trim(),
        color: teeColor.trim() || null,
        yardage: teeYardage
          ? Number(teeYardage)
          : null,
        par: teePar
          ? Number(teePar)
          : 72,
        rating: teeRating
          ? Number(teeRating)
          : null,
        slope: teeSlope
          ? Number(teeSlope)
          : null,
      })
      .select("*")
      .single();

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setTees((current) =>
      [...current, data].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );

    setTeeName("");
    setTeeColor("");
    setTeeYardage("");
    setTeePar("72");
    setTeeRating("");
    setTeeSlope("");
    setShowTeeForm(false);
    setSaving(false);
  }
  async function updateTee() {
  if (!editingTeeId) {
    return;
  }

  if (!teeName.trim()) {
    setErrorMessage("Tee name is required.");
    return;
  }

  setSaving(true);
  setErrorMessage("");

  const { data, error } = await supabase
    .from("course_tees")
    .update({
      name: teeName.trim(),
      color: teeColor.trim() || null,
      yardage: teeYardage ? Number(teeYardage) : null,
      par: teePar ? Number(teePar) : 72,
      rating: teeRating ? Number(teeRating) : null,
      slope: teeSlope ? Number(teeSlope) : null,
    })
    .eq("id", editingTeeId)
    .select("*")
    .single();

  if (error) {
    console.error(error);
    setErrorMessage(error.message);
    setSaving(false);
    return;
  }

  setTees((current) =>
    current.map((tee) =>
      tee.id === editingTeeId ? data : tee
    )
  );

  setEditingTeeId(null);
  setShowTeeForm(false);
  setTeeName("");
  setTeeColor("");
  setTeeYardage("");
  setTeePar("72");
  setTeeRating("");
  setTeeSlope("");
  setSaving(false);
}
async function deleteTee(teeId: string) {
  const tee = tees.find(
    (item) => item.id === teeId
  );

  if (!tee) {
    return;
  }

  const confirmed = window.confirm(
    `Delete ${tee.name} tee?\n\n` +
    `This tee cannot be used by any round.`
  );

  if (!confirmed) {
    return;
  }

  setErrorMessage("");
  setSaving(true);

  try {
    const { data: roundsUsingTee, error: lookupError } =
      await supabase
        .from("rounds")
        .select("id, round_number")
        .eq("tee_id", teeId);

    if (lookupError) {
      throw lookupError;
    }

    if (
      roundsUsingTee &&
      roundsUsingTee.length > 0
    ) {
      const roundNumbers =
        roundsUsingTee
          .map(
            (round) =>
              `Round ${round.round_number}`
          )
          .join(", ");

      window.alert(
        `Cannot delete ${tee.name}.\n\n` +
        `It is being used by ${roundNumbers}.\n\n` +
        `Delete those rounds first.`
      );

      return;
    }

    const { error } = await supabase
      .from("course_tees")
      .delete()
      .eq("id", teeId);

    if (error) {
      throw error;
    }

    setTees((current) =>
      current.filter(
        (item) => item.id !== teeId
      )
    );

    setErrorMessage("");
  } catch (error: any) {
    console.error(
      "Error deleting tee:",
      error
    );

    setErrorMessage(
      error?.message ||
        "Unable to delete tee."
    );
  } finally {
    setSaving(false);
  }
}
async function deleteCourse(courseId: string) {
  const course = courses.find(
    (item) => item.id === courseId
  );

  if (!course) {
    return;
  }

  const confirmed = window.confirm(
    `Delete ${course.name}?\n\n` +
    `This will permanently delete the course, its tees, and its hole information.`
  );

  if (!confirmed) {
    return;
  }

  setErrorMessage("");
  setSaving(true);

  try {
    // Check whether any rounds are using this course.
    const { data: roundsUsingCourse, error: lookupError } =
      await supabase
        .from("rounds")
        .select("id, round_number")
        .eq("course_id", courseId);

    if (lookupError) {
      throw lookupError;
    }

    if (
      roundsUsingCourse &&
      roundsUsingCourse.length > 0
    ) {
      const roundNumbers =
        roundsUsingCourse
          .map(
            (round) =>
              `Round ${round.round_number}`
          )
          .join(", ");

      window.alert(
        `Cannot delete ${course.name}.\n\n` +
        `It is being used by ${roundNumbers}.\n\n` +
        `Delete those rounds first.`
      );

      return;
    }

    // Delete hole information first.
    const { error: holeError } = await supabase
      .from("hole_information")
      .delete()
      .eq("course_id", courseId);

    if (holeError) {
      throw holeError;
    }

    // Delete tees for this course.
    const { error: teeError } = await supabase
      .from("course_tees")
      .delete()
      .eq("course_id", courseId);

    if (teeError) {
      throw teeError;
    }

    // Finally delete the course itself.
    const { error: courseError } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (courseError) {
      throw courseError;
    }

    // Remove it from the UI only after the database
    // deletion succeeds.
    setCourses((current) =>
      current.filter(
        (item) => item.id !== courseId
      )
    );

    setTees((current) =>
      current.filter(
        (tee) => tee.course_id !== courseId
      )
    );

    setHoles((current) =>
      current.filter(
        (hole) => hole.course_id !== courseId
      )
    );

    if (selectedCourseId === courseId) {
      setSelectedCourseId(null);
    }

    setErrorMessage("");
  } catch (error: any) {
    console.error(
      "Error deleting course:",
      error
    );

    setErrorMessage(
      error?.message ||
        "Unable to delete course."
    );
  } finally {
    setSaving(false);
  }
}
  if (selectedCourse) {
    return (
      <section>
        <div className="sectionTop">
          <div>
            <h2>{selectedCourse.name}</h2>

            <p>
              {selectedCourse.location ||
                "Location not entered"}{" "}
              · {selectedCourse.holes || 18} holes
            </p>
          </div>

          <button
            className="icon"
            onClick={() => {
              setSelectedCourseId(null);
              setShowTeeForm(false);
            }}
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="attention">
            <p>⚠ {errorMessage}</p>
          </div>
        )}

        {/* TEES */}
        <div className="card">
          <div className="sectionTop">
            <div>
              <h3>Tees</h3>
              <p>
                Rating, slope, yardage and par.
              </p>
            </div>

            <button
              className="primary"
              onClick={() =>
                setShowTeeForm(true)
              }
            >
              <Plus size={17} />
              Add tee
            </button>
          </div>

          {showTeeForm && (
            <div
              className="card"
              style={{ marginBottom: "15px" }}
            >
              <div className="cardHead">
                <h3>{editingTeeId ? "Edit Tee" : "Add Tee"}</h3>

                <button
                  className="icon"
                  onClick={() =>
                    setShowTeeForm(false)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "15px",
                }}
              >
                <label>
                  Tee Name
                  <input
                    value={teeName}
                    onChange={(e) =>
                      setTeeName(e.target.value)
                    }
                    placeholder="Blue"
                  />
                </label>

                <label>
                  Color
                  <input
                    value={teeColor}
                    onChange={(e) =>
                      setTeeColor(e.target.value)
                    }
                    placeholder="Blue"
                  />
                </label>

                <label>
                  Yardage
                  <input
                    type="number"
                    value={teeYardage}
                    onChange={(e) =>
                      setTeeYardage(e.target.value)
                    }
                    placeholder="7100"
                  />
                </label>

                <label>
                  Par
                  <input
                    type="number"
                    value={teePar}
                    onChange={(e) =>
                      setTeePar(e.target.value)
                    }
                    placeholder="72"
                  />
                </label>

                <label>
                  Course Rating
                  <input
                    type="number"
                    step="0.1"
                    value={teeRating}
                    onChange={(e) =>
                      setTeeRating(e.target.value)
                    }
                    placeholder="73.2"
                  />
                </label>

                <label>
                  Slope
                  <input
                    type="number"
                    value={teeSlope}
                    onChange={(e) =>
                      setTeeSlope(e.target.value)
                    }
                    placeholder="140"
                  />
                </label>

                <button
                  className="primary"
                  onClick={editingTeeId ? updateTee : createTee}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTeeId
                      ?"Update Tee"
                      : "Save Tee"}
                </button>
              </div>
            </div>
          )}

          {courseTees.length === 0 ? (
            <p
              style={{
                color: "#879087",
                fontSize: "12px",
              }}
            >
              No tees added yet.
            </p>
          ) : (
            <div className="cards">
              {courseTees.map((tee) => (
                <div
                  className="card"
                  key={tee.id}
                >
                  <div className="cardHead">
                    <div>
                      <h3>{tee.name}</h3>

                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#879087",
                          fontSize: "11px",
                        }}
                      >
                        {tee.yardage
                          ? `${tee.yardage.toLocaleString()} yards`
                          : "Yardage not entered"}
                      </p>
                    </div>

                    <span className="pill usa">
                      {tee.rating ?? "—"} /{" "}
                      {tee.slope ?? "—"}
                      <button
  className="link"
  onClick={() => {
    setEditingTeeId(tee.id);
    setShowTeeForm(true);
    setTeeName(tee.name);
    setTeeColor(tee.color || "");
    setTeeYardage(
      tee.yardage?.toString() || ""
    );
    setTeePar(
      tee.par?.toString() || "72"
    );
    setTeeRating(
      tee.rating?.toString() || ""
    );
    setTeeSlope(
      tee.slope?.toString() || ""
    );
  }}
>
  Edit
</button>

<button
  className="link"
  onClick={() =>
    deleteTee(tee.id)
  }
  disabled={saving}
>
  Delete
</button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HOLES */}
        <div
          className="card"
          style={{ marginTop: "20px" }}
        >
          <div className="sectionTop">
            <div>
              <h3>Hole Information</h3>
              <p>
                Enter par, yardage and handicap rank
                for each hole.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                className="link"
                onClick={cancelHoleChanges}
              >
                Cancel changes
              </button>

              <button
                className="primary"
                onClick={saveHoles}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save All Holes"}
              </button>
            </div>
          </div>

          {holeSaveMessage && (
            <div
              style={{
                padding: "10px 12px",
                marginBottom: "12px",
                borderRadius: "8px",
                background:
                  holeSaveMessage.startsWith("⚠") ||
                  holeSaveMessage.startsWith("Could")
                    ? "#fff3f0"
                    : "#eef7ee",
                color:
                  holeSaveMessage.startsWith("⚠") ||
                  holeSaveMessage.startsWith("Could")
                    ? "#8a3d2e"
                    : "#2f6b35",
                fontSize: "12px",
              }}
            >
              {holeSaveMessage}
            </div>
          )}

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Hole</th>
                  <th>Par</th>
                  <th>Yardage</th>
                  <th>Handicap</th>
                </tr>
              </thead>

              <tbody>
                {draftHoles.map((hole) => (
                  <tr key={hole.hole_number}>
                    <td>
                      <b>{hole.hole_number}</b>
                    </td>

                    <td>
                      <input
                        type="number"
                        min="3"
                        max="6"
                        value={hole.par}
                        onChange={(e) =>
                          updateDraftHole(
                            hole.hole_number,
                            "par",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        value={hole.yardage ?? ""}
                        placeholder="425"
                        onChange={(e) =>
                          updateDraftHole(
                            hole.hole_number,
                            "yardage",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        max={Number(selectedCourse.holes) || 18}
                        value={hole.handicap_rank ?? ""}
                        placeholder="11"
                        onChange={(e) =>
                          updateDraftHole(
                            hole.hole_number,
                            "handicap_rank",
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Courses</h2>
          <p>
            Manage courses, tees and course
            information.
          </p>
        </div>

        <button
          className="primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={17} />
          Add course
        </button>
      </div>

      {showForm && (
        <div className="card compose">
          <div className="cardHead">
            <h3>
              {editingCourseId ? "Edit Course" : "Add Course"}
            </h3>

            <button
              className="icon"
              onClick={() =>
                setShowForm(false)
              }
            >
              <X size={18} />
            </button>
          </div>

          <label>
            Course Name
            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Troon North"
            />
          </label>

          <label>
            Location
            <input
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              placeholder="Scottsdale, Arizona"
            />
          </label>

          <label>
            Number of Holes
            <select
              value={holeCount}
              onChange={(e) =>
                setHoleCount(e.target.value)
              }
            >
              <option value="18">18</option>
              <option value="9">9</option>
            </select>
          </label>

          {errorMessage && (
            <div className="attention">
              <p>⚠ {errorMessage}</p>
            </div>
          )}

          <button
            className="primary"
            onClick={editingCourseId ? updateCourse : createCourse}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingCourseId
               ?"Update Course"
               : "Save Course"}
          </button>
        </div>
      )}

      <div className="cards">
        {courses.map((course) => (
          <div
            className="card"
            key={course.id}
          >
            <div className="cardHead">
              <div>
                <h3>{course.name}</h3>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#879087",
                    fontSize: "11px",
                  }}
                >
                  {course.location ||
                    "Location not entered"}
                </p>
              </div>

              <span className="pill usa">
                {course.holes || 18} holes
              </span>
            </div>

            <div
  style={{
    display: "flex",
    gap: "12px",
    alignItems: "center",
  }}
>
  <button
    className="link"
    onClick={() =>
      setSelectedCourseId(course.id)
    }
  >
    Manage course
    <ChevronRight size={15} />
  </button>

  <button
    className="link"
    onClick={() => {
      setEditingCourseId(course.id);
      setName(course.name);
      setLocation(course.location || "");
      setHoleCount(
        String(course.holes || 18)
      );
      setShowForm(true);
    }}
  >
    Edit
  </button>

  <button
  className="link"
  onClick={() =>
    deleteCourse(course.id)
  }
  disabled={saving}
>
  Delete
</button>
</div>
          </div>
        ))}
      </div>
    </section>
  );
}
function Rounds({
  rounds,
  courses,
  tees,
  players,
  tripId,
  setRounds,
}: {
  rounds: any[];
  courses: any[];
  tees: Tee[];
  players: Player[];
  tripId: string;
  setRounds: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [tripPlayerIds, setTripPlayerIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoundId, setEditingRoundId] =
  useState<string | null>(null);
  const [roundNumber, setRoundNumber] = useState("1");
  const [courseId, setCourseId] = useState("");
  const [teeId, setTeeId] = useState("");
  const [format, setFormat] = useState("Four-Ball");
  const [handicapAllowance, setHandicapAllowance] = useState("100");

  const [teeTime, setTeeTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const availableTees = tees.filter(
  (tee) => tee.course_id === courseId
);
  const [roundHandicaps, setRoundHandicaps] = useState<any[]>([]);

  useEffect(() => {
  async function loadTripPlayers() {
    if (!tripId) {
      setTripPlayerIds([]);
      return;
    }

    const { data, error } = await supabase
      .from("trip_players")
      .select("player_id")
      .eq("trip_id", tripId);

    if (error) {
      console.error("Error loading trip players:", error);
      setTripPlayerIds([]);
      return;
    }

    setTripPlayerIds(
      (data || []).map((row) => row.player_id)
    );
  }

  loadTripPlayers();
}, [tripId]);
  useEffect(() => {
  async function loadAllRoundHandicaps() {
    const { data, error } = await supabase
      .from("round_player_handicaps")
      .select(`
        *,
        players (
          first_name,
          last_name
        ),
        course_tees (
          name
        )
      `)
      .in(
        "round_id",
        rounds.map((round) => round.id)
      );

    if (error) {
      console.error(
        "Error loading round handicaps:",
        error
      );
      return;
    }

    setRoundHandicaps(data || []);
  }

  if (rounds.length > 0) {
    loadAllRoundHandicaps();
  } else {
    setRoundHandicaps([]);
  }
}, [rounds]);


  async function createRound() {
  setErrorMessage("");

  if (!tripId) {
  setErrorMessage("No trip is available.");
  return;
}

  if (!courseId) {
    setErrorMessage("Please select a course.");
    return;
  }
  if (!teeId) {
  setErrorMessage("Please select a tee.");
  return;
}

  setSaving(true);

  const roundData = {
  trip_id: tripId,
  course_id: courseId,
  tee_id: teeId,
  round_number: Number(roundNumber),
  format,
  handicap_allowance:
    Number(handicapAllowance) / 100,
  tee_time: teeTime || null,
};

const { data, error } = editingRoundId
  ? await supabase
      .from("rounds")
      .update(roundData)
      .eq("id", editingRoundId)
      .select("*")
      .single()
  : await supabase
      .from("rounds")
      .insert(roundData)
      .select("*")
      .single();

  if (error) {
    console.error(error);
    setErrorMessage(error.message);
    setSaving(false);
    return;
  }

  // We can't directly change the rounds prop yet,
  // so we'll handle the list refresh in App next.
  setRounds((current) =>
  editingRoundId
    ? current
        .map((round) =>
          round.id === editingRoundId
            ? data
            : round
        )
        .sort(
          (a, b) =>
            a.round_number - b.round_number
        )
    : [...current, data].sort(
        (a, b) =>
          a.round_number - b.round_number
      )
);

setRoundNumber("");
setCourseId("");
setTeeId("");
setFormat("Four-Ball");
setTeeTime("");
setHandicapAllowance("100");
setEditingRoundId(null);
setShowForm(false);
setSaving(false);
}
async function loadRoundHandicaps(roundId: string) {
  const { data, error } = await supabase
    .from("round_player_handicaps")
    .select(`
      *,
      players (
        first_name,
        last_name
      ),
      course_tees (
        name
      )
    `)
    .eq("round_id", roundId)
    .order("playing_handicap", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return;
  }

  setRoundHandicaps(data || []);
}
async function calculateRoundHandicaps(round: any) {
  setErrorMessage("");

  const tee = tees.find(
    (item) => item.id === round.tee_id
  );

  if (!tee) {
    setErrorMessage(
      "This round does not have a valid tee selected."
    );
    return;
  }

  if (
    tee.rating === null ||
    tee.slope === null ||
    tee.par === null
  ) {
    setErrorMessage(
      "The selected tee needs a rating, slope and par before handicaps can be calculated."
    );
    return;
  }

  setSaving(true);

  const allowance =
    Number(round.handicap_allowance ?? 1);

  const rows = players
  .filter((player) => tripPlayerIds.includes(player.id))
  .filter((player) => player.handicap !== null)
  .map((player) => {
      const handicapIndex =
        Number(player.handicap);

      const courseHandicap =
        handicapIndex *
          (Number(tee.slope) / 113) +
        (Number(tee.rating) -
          Number(tee.par));

      const playingHandicap = Math.round(
        courseHandicap * allowance
      );

      return {
        round_id: round.id,
        player_id: player.id,
        tee_id: tee.id,
        handicap_index: handicapIndex,
        course_handicap:
          Number(courseHandicap.toFixed(2)),
        handicap_allowance: allowance,
        playing_handicap:
          playingHandicap,
      };
    });

  if (rows.length === 0) {
    setErrorMessage(
      "No players with handicaps were found for this trip."
    );
    setSaving(false);
    return;
  }

  const { error: deleteError } = await supabase
    .from("round_player_handicaps")
    .delete()
    .eq("round_id", round.id);

  if (deleteError) {
    console.error(deleteError);
    setErrorMessage(deleteError.message);
    setSaving(false);
    return;
  }

  const { error } = await supabase
    .from("round_player_handicaps")
    .insert(rows);

  if (error) {
    console.error(error);
    setErrorMessage(error.message);
    setSaving(false);
    return;
  }

  await loadRoundHandicaps(round.id);

  setErrorMessage("");
  setSaving(false);

  alert(
    `Handicaps calculated for ${rows.length} players.`
  );
}
  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Rounds</h2>
          <p>Manage courses, tees, formats and scoring.</p>
        </div>

        <button
  className="primary"
  onClick={() => setShowForm(true)}
>
  <Plus size={17} /> Create round
</button>
      </div>

      <div className="cards">
        {showForm && (
  <div className="card compose">
    <div className="cardHead">
      <h3>Create Round</h3>

      <button
        className="icon"
        onClick={() => setShowForm(false)}
      >
        <X size={18} />
      </button>
    </div>

    <label>
      Round Number
      <input
        type="number"
        min="1"
        value={roundNumber}
        onChange={(e) =>
          setRoundNumber(e.target.value)
        }
      />
    </label>

    <label>
      Course
      <select
        value={courseId}
        onChange={(e) => {
  setCourseId(e.target.value);
  setTeeId("");
}}
      >
        <option value="">
          Select course...
        </option>

        {courses.map((course) => (
          <option
            key={course.id}
            value={course.id}
          >
            {course.name}
          </option>
        ))}
      </select>
    </label>
    <label>
  Tee
  <select
    value={teeId}
    onChange={(e) => setTeeId(e.target.value)}
    disabled={!courseId}
  >
    <option value="">
      {courseId
        ? "Select tee..."
        : "Select course first"}
    </option>

    {availableTees.map((tee) => (
      <option key={tee.id} value={tee.id}>
        {tee.name}
        {tee.rating && tee.slope
          ? ` — ${tee.rating} / ${tee.slope}`
          : ""}
      </option>
    ))}
  </select>
</label>

    <label>
      Format
      <select
        value={format}
        onChange={(e) =>
          setFormat(e.target.value)
        }
      >
        <option>Four-Ball</option>
        <option>Foursomes</option>
        <option>Singles</option>
      </select>
    </label>

    <label>
  Handicap Allowance
  <select
    value={handicapAllowance}
    onChange={(e) =>
      setHandicapAllowance(e.target.value)
    }
  >
    <option value="100">100%</option>
    <option value="90">90%</option>
    <option value="75">75%</option>
    <option value="50">50%</option>
  </select>
</label>

    <label>
      Tee Time
      <input
        type="datetime-local"
        value={teeTime}
        onChange={(e) =>
          setTeeTime(e.target.value)
        }
      />
    </label>

    {errorMessage && (
      <div className="attention">
        <p>⚠ {errorMessage}</p>
      </div>
    )}

    <button
      className="primary"
      onClick={createRound}
      disabled={saving}
    >
      {saving
  ? "Saving..."
  : editingRoundId
    ? "Update Round"
    : "Save Round"}
    </button>
  </div>
)}
        {rounds.length === 0 ? (
          <div className="card">
            <p
              style={{
                color: "#879087",
                fontSize: "12px",
              }}
            >
              No rounds have been created yet.
            </p>
          </div>
        ) : (
          rounds.map((round) => {
            const course = courses.find(
              (item) => item.id === round.course_id
            );

            return (
              <Card
                title={`Round ${round.round_number}`}
                key={round.id}
              >
                <div className="round">
                  <b>
                    {course?.name || "Course not assigned"}
                  </b>

                  <span>
  {round.format || "Format not set"}
  {" · "}
  {round.tee_time
    ? new Date(round.tee_time).toLocaleString()
    : "Tee time not set"}
  {" · "}
  {Math.round(
    Number(round.handicap_allowance ?? 1) * 100
  )}% handicap
</span>

                  <div
  style={{
    display: "flex",
    gap: "10px",
    alignItems: "center",
  }}
>
  <button
    className="primary"
    onClick={() =>
      calculateRoundHandicaps(round)
    }
    disabled={saving}
  >
    {saving
      ? "Calculating..."
      : "Calculate Handicaps"}
  </button>

  <button
  className="link"
  onClick={() => {
    setEditingRoundId(round.id);
    setRoundNumber(
      String(round.round_number ?? "")
    );
    setCourseId(round.course_id || "");
    setTeeId(round.tee_id || "");
    setFormat(
      round.format || "Four-Ball"
    );
    setHandicapAllowance(
      String(
        Math.round(
          Number(
            round.handicap_allowance ?? 1
          ) * 100
        )
      )
    );

  
    setTeeTime(
  round.tee_time
    ? String(round.tee_time).slice(0, 16)
    : ""
);
    setShowForm(true);
  }}
>
  Manage round <ChevronRight size={15} />
</button>
  <button
  className="link"
  onClick={() =>
    deleteRound(round.id)
  }
  disabled={saving}
>
  Delete
</button>
</div>

{roundHandicaps
  .filter((item) => item.round_id === round.id)
  .length > 0 && (
  <div
    className="card"
    style={{ marginTop: "15px" }}
  >
    <div className="cardHead">
      <h3>Round Handicaps</h3>
    </div>

    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Index</th>
            <th>Course</th>
            <th>Playing</th>
          </tr>
        </thead>

        <tbody>
          {roundHandicaps
            .filter(
              (item) =>
                item.round_id === round.id
            )
            .map((item) => (
              <tr key={item.id}>
                <td>
                  <b>
                    {item.players?.first_name}{" "}
                    {item.players?.last_name}
                  </b>
                </td>

                <td>
                  {item.handicap_index}
                </td>

                <td>
                  {item.course_handicap}
                </td>

                <td>
                  <b>
                    {item.playing_handicap}
                  </b>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
  async function deleteRound(
  roundId: string
) {
  const round = rounds.find(
    (item) => item.id === roundId
  );

  if (!round) {
    return;
  }

  const confirmed = window.confirm(
    `Delete Round ${round.round_number}?\n\n` +
    `This will delete the round's scores, handicaps, matches, and match scoring.`
  );

  if (!confirmed) {
    return;
  }

  setErrorMessage("");
  setSaving(true);

  try {
    // Find matches belonging to this round.
    const {
      data: relatedMatches,
      error: matchLookupError,
    } = await supabase
      .from("matches")
      .select("id")
      .eq("round_id", roundId);

    if (matchLookupError) {
      throw matchLookupError;
    }

    const matchIds =
      relatedMatches?.map(
        (match) => match.id
      ) || [];

    // Delete all match-related records first.
    if (matchIds.length > 0) {
      const {
        error: holeResultError,
      } = await supabase
        .from("match_hole_results")
        .delete()
        .in("match_id", matchIds);

      if (holeResultError) {
        throw holeResultError;
      }

      const {
        error: sideScoreError,
      } = await supabase
        .from("match_side_hole_scores")
        .delete()
        .in("match_id", matchIds);

      if (sideScoreError) {
        throw sideScoreError;
      }

      const {
        error: sideHandicapError,
      } = await supabase
        .from("match_side_handicaps")
        .delete()
        .in("match_id", matchIds);

      if (sideHandicapError) {
        throw sideHandicapError;
      }

      const {
        error: matchHandicapError,
      } = await supabase
        .from("match_player_handicaps")
        .delete()
        .in("match_id", matchIds);

      if (matchHandicapError) {
        throw matchHandicapError;
      }

      const {
        error: matchPlayersError,
      } = await supabase
        .from("match_players")
        .delete()
        .in("match_id", matchIds);

      if (matchPlayersError) {
        throw matchPlayersError;
      }

      const {
        error: matchDeleteError,
      } = await supabase
        .from("matches")
        .delete()
        .in("id", matchIds);

      if (matchDeleteError) {
        throw matchDeleteError;
      }
    }

    // Delete round scores.
    const {
      error: scoreError,
    } = await supabase
      .from("round_scores")
      .delete()
      .eq("round_id", roundId);

    if (scoreError) {
      throw scoreError;
    }

    // Delete round handicaps.
    const {
      error: handicapError,
    } = await supabase
      .from("round_player_handicaps")
      .delete()
      .eq("round_id", roundId);

    if (handicapError) {
      throw handicapError;
    }

    // Finally delete the round.
    const {
      error: roundDeleteError,
    } = await supabase
      .from("rounds")
      .delete()
      .eq("id", roundId);

    if (roundDeleteError) {
      throw roundDeleteError;
    }

    // Remove from the visible list.
    setRounds((current) =>
      current.filter(
        (item) => item.id !== roundId
      )
    );

    // Remove stale handicap rows from local state.
    setRoundHandicaps((current) =>
      current.filter(
        (item) =>
          item.round_id !== roundId
      )
    );

    setErrorMessage("");
  } catch (error: any) {
    console.error(
      "Error deleting round:",
      error
    );

    setErrorMessage(
      error?.message ||
        "Unable to delete round."
    );
  } finally {
    setSaving(false);
  }
}
}
function strokesOnHole(
  playingHandicap: number,
  handicapRank: number
): number {
  if (playingHandicap <= 0) {
    return 0;
  }

  const fullRounds =
    Math.floor(playingHandicap / 18);

  const remainder =
    playingHandicap % 18;

  return (
    fullRounds +
    (handicapRank <= remainder ? 1 : 0)
  );
}
function calculateCourseHandicap(
  handicapIndex: number,
  slope: number,
  rating: number,
  par: number
): number {
  return (
    handicapIndex * (slope / 113) +
    (rating - par)
  );
}
function Scorecards({
  rounds,
  courses,
  players,
  tees,
  holes,
  selectedRoundId,
  setSelectedRoundId,
  useHandicaps,
  selectedTripId,
}: {
  rounds: any[];
  courses: any[];
  players: Player[];
  tees: Tee[];
  holes: Hole[];
  selectedRoundId: string | null;
  setSelectedRoundId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  useHandicaps: boolean;
  selectedTripId: string | null;
}) {
    const scoreInputRefs =
    useRef<
      Record<string, HTMLInputElement | null>
    >({});

  const [tripPlayerIds, setTripPlayerIds] =
    useState<string[]>([]);

  const [scores, setScores] =
    useState<any[]>([]);

  const [roundHandicaps, setRoundHandicaps] =
    useState<any[]>([]);
    

  useEffect(() => {
  async function loadTripPlayers() {
    if (!selectedTripId) {
      setTripPlayerIds([]);
      return;
    }

    const { data, error } = await supabase
      .from("trip_players")
      .select("player_id")
      .eq("trip_id", selectedTripId);

    if (error) {
      console.error(
        "Error loading trip players:",
        error
      );
      setTripPlayerIds([]);
      return;
    }

    setTripPlayerIds(
      (data || []).map((row) => row.player_id)
    );
  }

  loadTripPlayers();
}, [selectedTripId]);

  const singlesRounds = rounds.filter(
  (round) => round.format === "Singles"
);

const selectedRound = singlesRounds.find(
  (round) => round.id === selectedRoundId
);

useEffect(() => {
  if (
    selectedRoundId &&
    !singlesRounds.some(
      (round) => round.id === selectedRoundId
    )
  ) {
    setSelectedRoundId(null);
    setScores([]);
    setRoundHandicaps([]);
  }
}, [selectedRoundId, singlesRounds]);

  const selectedTee = tees.find(
  (tee) => tee.id === selectedRound?.tee_id
);

    const tripPlayers = players.filter((player) =>
    tripPlayerIds.includes(player.id)
  );

  const roundHoles = holes
    .filter(
      (hole) =>
        selectedRound &&
        hole.course_id === selectedRound.course_id
    )
    .sort(
      (a, b) => a.hole_number - b.hole_number
    );


    async function loadScores(roundId: string) {
    const { data, error } = await supabase
      .from("round_scores")
      .select("*")
      .eq("round_id", roundId)
      .order("player_id", {
        ascending: true,
      })
      .order("hole_number", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      return;
    }

    setScores(data || []);
  }

    async function loadPlayingHandicaps(roundId: string) {
    if (!useHandicaps) {
      setRoundHandicaps([]);
      return;
    }

    const { data, error } = await supabase
      .from("round_player_handicaps")
      .select("player_id, playing_handicap")
      .eq("round_id", roundId);

    if (error) {
      console.error(
        "Error loading playing handicaps:",
        error
      );
      setRoundHandicaps([]);
      return;
    }

    setRoundHandicaps(data || []);
  }

  useEffect(() => {
  if (!selectedRoundId) {
    setScores([]);
    setRoundHandicaps([]);
    return;
  }

  loadScores(selectedRoundId);
  loadPlayingHandicaps(selectedRoundId);
}, [selectedRoundId, useHandicaps]);

    async function saveScore(
    playerId: string,
    holeNumber: number,
    value: string
  ) {
    if (!selectedRoundId || !playerId) {
      return;
    }

    if (value === "") {
      const { error } = await supabase
        .from("round_scores")
        .delete()
        .eq("round_id", selectedRoundId)
        .eq("player_id", playerId)
        .eq("hole_number", holeNumber);

      if (error) {
        console.error(error);
        return;
      }

      setScores((current) =>
        current.filter(
          (score) =>
            !(
              score.player_id === playerId &&
              score.hole_number === holeNumber
            )
        )
      );

      return;
    }

    const grossScore = Number(value);

    if (
      !Number.isInteger(grossScore) ||
      grossScore < 1 ||
      grossScore > 20
    ) {
      return;
    }

    const { data, error } = await supabase
      .from("round_scores")
      .upsert(
        {
          round_id: selectedRoundId,
          player_id: playerId,
          hole_number: holeNumber,
          gross_score: grossScore,
        },
        {
          onConflict:
            "round_id,player_id,hole_number",
        }
      )
      .select("*")
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setScores((current) => {
      const withoutCurrent = current.filter(
        (score) =>
          !(
            score.player_id === playerId &&
            score.hole_number === holeNumber
          )
      );

      return [...withoutCurrent, data].sort(
        (a, b) =>
          a.player_id.localeCompare(b.player_id) ||
          a.hole_number - b.hole_number
      );
    });

    // Move focus to the next hole for this player.
    const nextHole = roundHoles.find(
      (hole) =>
        hole.hole_number > holeNumber
    );

    if (nextHole) {
      setTimeout(() => {
        const nextInput =
          scoreInputRefs.current[
            `${playerId}-${nextHole.hole_number}`
          ];

        nextInput?.focus();
        nextInput?.select();
      }, 50);
    }
  }

      function getGrossScore(
    playerId: string,
    holeNumber: number
  ) {
    return (
      scores.find(
        (score) =>
          score.player_id === playerId &&
          score.hole_number === holeNumber
      )?.gross_score ?? ""
    );
  }

    function getPlayingHandicap(
    playerId: string
  ): number | null {
    return (
      roundHandicaps.find(
        (item) =>
          item.player_id === playerId
      )?.playing_handicap ?? null
    );
  }

  function getStrokesForHole(
    playerId: string,
    handicapRank: number
  ): number {
    const handicap =
      getPlayingHandicap(playerId);

    if (handicap === null) {
      return 0;
    }

    return strokesOnHole(
      handicap,
      handicapRank
    );
  }

  function getNetScore(
  playerId: string,
  hole: Hole
): number | null {
  const gross = getGrossScore(
    playerId,
    hole.hole_number
  );

  if (
    gross === "" ||
    gross === null ||
    Number.isNaN(Number(gross))
  ) {
    return null;
  }

  if (!useHandicaps) {
    return Number(gross);
  }

  return (
    Number(gross) -
    getStrokesForHole(
      playerId,
      hole.handicap_rank ?? 18
    )
  );
}

  function getFrontNineGross(
  playerId: string
): number {
  return roundHoles
    .filter(
      (hole) => hole.hole_number <= 9
    )
    .reduce((total, hole) => {
      const score = getGrossScore(
        playerId,
        hole.hole_number
      );

      return total + (
        score === "" ? 0 : Number(score)
      );
    }, 0);
}

function getBackNineGross(
  playerId: string
): number {
  return roundHoles
    .filter(
      (hole) => hole.hole_number >= 10
    )
    .reduce((total, hole) => {
      const score = getGrossScore(
        playerId,
        hole.hole_number
      );

      return total + (
        score === "" ? 0 : Number(score)
      );
    }, 0);
}

function getTotalGross(
  playerId: string
): number {
  return (
    getFrontNineGross(playerId) +
    getBackNineGross(playerId)
  );
}

  function getCompletedHoleCount(
  playerId: string
): number {
  return roundHoles.filter(
    (hole) => {
      const score = getGrossScore(
        playerId,
        hole.hole_number
      );

      return (
        score !== "" &&
        score !== null &&
        !Number.isNaN(Number(score))
      );
    }
  ).length;
}

  function getFrontNineNet(
  playerId: string
): number {
  return roundHoles
    .filter(
      (hole) => hole.hole_number <= 9
    )
    .reduce((total, hole) => {
      const net = getNetScore(
        playerId,
        hole
      );

      return total + (
        net === null ? 0 : net
      );
    }, 0);
}

  function getBackNineNet(
  playerId: string
): number {
  return roundHoles
    .filter(
      (hole) => hole.hole_number >= 10
    )
    .reduce((total, hole) => {
      const net = getNetScore(
        playerId,
        hole
      );

      return total + (
        net === null ? 0 : net
      );
    }, 0);
}

  function getTotalNet(
  playerId: string
): number {
  return (
    getFrontNineNet(playerId) +
    getBackNineNet(playerId)
  );
}

  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Singles Scorecards</h2>
<p>
  Enter gross scores and calculate net scores
  for Singles matches.
</p>
        </div>
      </div>

      <div className="card compose">
        <label>
          Round
          <select
            value={selectedRoundId || ""}
            onChange={(e) => {
  const value = e.target.value;

  setSelectedRoundId(
    value || null
  );
  setScores([]);
            }}
          >
            <option value="">
              Select round...
            </option>

            {singlesRounds.map((round) => (
              <option
  key={round.id}
  value={round.id}
>
  {(() => {
    const roundCourse = courses.find(
      (course) =>
        course.id === round.course_id
    );

    const roundTee = tees.find(
      (tee) =>
        tee.id === round.tee_id
    );

    return `Round ${round.round_number} — ${
      roundCourse?.name || "Course"
    } — ${roundTee?.name || "Tee"} — ${
      round.format || "Format"
    }`;
  })()}
</option>
            ))}
          </select>
        </label>

                {selectedRoundId && (
          <button
            type="button"
            onClick={() => {
              loadScores(selectedRoundId);
              loadPlayingHandicaps(selectedRoundId);
            }}
          >
            Refresh Scores
          </button>
        )}
      </div>

            {selectedRound && (
        <div>
          {tripPlayers.map((player) => {
            const playerHandicap =
              getPlayingHandicap(player.id);

            function playerGross(
              holeNumber: number
            ) {
              return getGrossScore(
                player.id,
                holeNumber
              );
            }

            function playerNet(
              hole: Hole
            ): number | null {
              const gross = playerGross(
                hole.hole_number
              );

              if (
                gross === "" ||
                gross === null ||
                Number.isNaN(Number(gross))
              ) {
                return null;
              }

              if (!useHandicaps) {
                return Number(gross);
              }

              return (
                Number(gross) -
                getStrokesForHole(
                  player.id,
                  hole.handicap_rank ?? 18
                )
              );
            }

            function playerCompletedHoles() {
              return roundHoles.filter(
                (hole) => {
                  const score = playerGross(
                    hole.hole_number
                  );

                  return (
                    score !== "" &&
                    score !== null &&
                    !Number.isNaN(Number(score))
                  );
                }
              ).length;
            }

            function playerFrontGross() {
              return roundHoles
                .filter(
                  (hole) =>
                    hole.hole_number <= 9
                )
                .reduce(
                  (total, hole) => {
                    const score =
                      playerGross(
                        hole.hole_number
                      );

                    return (
                      total +
                      (score === ""
                        ? 0
                        : Number(score))
                    );
                  },
                  0
                );
            }

            function playerBackGross() {
              return roundHoles
                .filter(
                  (hole) =>
                    hole.hole_number >= 10
                )
                .reduce(
                  (total, hole) => {
                    const score =
                      playerGross(
                        hole.hole_number
                      );

                    return (
                      total +
                      (score === ""
                        ? 0
                        : Number(score))
                    );
                  },
                  0
                );
            }

            function playerTotalGross() {
              return (
                playerFrontGross() +
                playerBackGross()
              );
            }

            function playerFrontNet() {
              return roundHoles
                .filter(
                  (hole) =>
                    hole.hole_number <= 9
                )
                .reduce(
                  (total, hole) => {
                    const net = playerNet(
                      hole
                    );

                    return (
                      total +
                      (net === null
                        ? 0
                        : net)
                    );
                  },
                  0
                );
            }

            function playerBackNet() {
              return roundHoles
                .filter(
                  (hole) =>
                    hole.hole_number >= 10
                )
                .reduce(
                  (total, hole) => {
                    const net = playerNet(
                      hole
                    );

                    return (
                      total +
                      (net === null
                        ? 0
                        : net)
                    );
                  },
                  0
                );
            }

            function playerTotalNet() {
              return (
                playerFrontNet() +
                playerBackNet()
              );
            }

            return (
              <div
                className="card"
                key={player.id}
                style={{
                  marginTop: "16px",
                }}
              >
                <div className="cardHead">
                  <div>
                    <h3>
                      {player.first_name}{" "}
                      {player.last_name}
                    </h3>

                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#879087",
                        fontSize: "11px",
                      }}
                    >
                      {courses.find(
                        (course) =>
                          course.id ===
                          selectedRound.course_id
                      )?.name || "Course"}
                    </p>

                    {useHandicaps && (
                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#879087",
                          fontSize: "11px",
                        }}
                      >
                        Playing Handicap:{" "}
                        {playerHandicap ??
                          "Not calculated"}
                      </p>
                    )}

                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#879087",
                        fontSize: "11px",
                      }}
                    >
                      Completed:{" "}
                      {playerCompletedHoles()}/
                      {roundHoles.length}
                      {playerCompletedHoles() ===
                        roundHoles.length &&
                        roundHoles.length > 0
                        ? " • Round Complete"
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Hole</th>
                        <th>Par</th>
                        <th>HCP</th>
                        <th>Gross</th>
                        <th>Strokes</th>
                        <th>Net</th>
                      </tr>
                    </thead>

                    <tbody>
                      {roundHoles.map(
                        (hole) => (
                          <tr key={hole.id}>
                            <td>
                              <b>
                                {hole.hole_number}
                              </b>
                            </td>

                            <td>
                              {hole.par}
                            </td>

                            <td>
                              {
                                hole.handicap_rank
                              }
                            </td>

                            <td>
                              <input
                                ref={(element) => {
                                  scoreInputRefs.current[
                                    `${player.id}-${hole.hole_number}`
                                  ] = element;
                                }}
                                type="number"
                                min="1"
                                max="20"
                                value={playerGross(
                                  hole.hole_number
                                )}
                                                                onChange={(e) =>
                                  saveScore(
                                    player.id,
                                    hole.hole_number,
                                    e.target.value
                                  )
                                }
                                style={{
                                  width: "70px",
                                }}
                              />
                            </td>

                            <td>
                              {useHandicaps
                                ? getStrokesForHole(
                                    player.id,
                                    hole.handicap_rank ??
                                      18
                                  )
                                : "—"}
                            </td>

                            <td>
                              <b>
                                {useHandicaps
                                  ? playerNet(
                                      hole
                                    ) ?? "—"
                                  : "—"}
                              </b>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3, 1fr)",
                      gap: "10px",
                      marginTop: "20px",
                    }}
                  >
                    <div className="stat">
                      <b>
                        {playerFrontGross() ||
                          "—"}
                      </b>
                      <span>
                        Front Gross
                      </span>
                    </div>

                    <div className="stat">
                      <b>
                        {playerBackGross() ||
                          "—"}
                      </b>
                      <span>
                        Back Gross
                      </span>
                    </div>

                    <div className="stat">
                      <b>
                        {playerTotalGross() ||
                          "—"}
                      </b>
                      <span>
                        Total Gross
                      </span>
                    </div>

                    <div className="stat">
                      <b>
                        {playerFrontNet() ||
                          "—"}
                      </b>
                      <span>
                        Front Net
                      </span>
                    </div>

                    <div className="stat">
                      <b>
                        {playerBackNet() ||
                          "—"}
                      </b>
                      <span>
                        Back Net
                      </span>
                    </div>

                    <div className="stat">
                      <b>
                        {playerTotalNet() ||
                          "—"}
                      </b>
                      <span>
                        Total Net
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
function Matches({
  matches,
  rounds,
  courses,
  players,
  setMatches,
  selectedMatchId,
  setSelectedMatchId,
  useHandicaps,
  pointSystem,
  userRole,
}: {
  matches: any[];
  rounds: any[];
  courses: any[];
  players: Player[];
  setMatches: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  selectedMatchId: string | null;
  setSelectedMatchId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  useHandicaps: boolean;
  pointSystem: "match" | "three_point";
  userRole: "player" | "admin" | null;
}) {
  const [showForm, setShowForm] = useState(false);

  const [roundId, setRoundId] = useState("");
  const [matchType, setMatchType] = useState("Best Ball");

  const [sideA1, setSideA1] = useState("");
  const [sideA2, setSideA2] = useState("");

  const [sideB1, setSideB1] = useState("");
  const [sideB2, setSideB2] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [matchHandicaps, setMatchHandicaps] = useState<any[]>([]);

  const [tripPlayerIds, setTripPlayerIds] =
  useState<string[]>([]);

  const [matchPlayersMap, setMatchPlayersMap] =
  useState<Record<string, any[]>>({});
  useEffect(() => {
  async function loadAllMatchPlayers() {
    if (matches.length === 0) {
      setMatchPlayersMap({});
      return;
    }

    const { data, error } = await supabase
      .from("match_players")
      .select("*")
      .in(
        "match_id",
        matches.map((match) => match.id)
      );

    if (error) {
      console.error(
        "Error loading match players:",
        error
      );
      return;
    }

    const grouped: Record<string, any[]> =
      {};

    (data || []).forEach((player) => {
      if (!grouped[player.match_id]) {
        grouped[player.match_id] = [];
      }

      grouped[player.match_id].push(
        player
      );
    });

    setMatchPlayersMap(grouped);
  }

  loadAllMatchPlayers();
}, [matches]);

  const [matchHoleResults, setMatchHoleResults] =
  useState<any[]>([]);

  const [altShotScores, setAltShotScores] =
  useState<any[]>([]);

  const [bestBallScores, setBestBallScores] =
  useState<any[]>([]);

  const [bestBallInputs, setBestBallInputs] =
  useState<Record<string, string>>({});
  async function loadMatchHoleResults(
  matchId: string
) {
  const { data, error } = await supabase
    .from("match_hole_results")
    .select("*")
    .eq("match_id", matchId)
    .order("hole_number", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading match hole results:",
      error
    );
    return;
  }

  setMatchHoleResults(data || []);
}

  const selectedMatch = matches.find(
  (match) => match.id === selectedMatchId
);

useEffect(() => {
  async function reloadSelectedMatch() {
    if (!selectedMatchId) {
      return;
    }

    const match = matches.find(
      (item) => item.id === selectedMatchId
    );

    if (!match) {
      return;
    }

    await loadMatchHoleResults(selectedMatchId);

    if (match.match_type === "Singles") {
      await loadSinglesScores(selectedMatchId);
    }

    if (match.match_type === "Best Ball") {
      await loadBestBallScores(selectedMatchId);
    }

    if (match.match_type === "Alt Shot") {
      await loadAltShotScores(selectedMatchId);
    }
  }

  reloadSelectedMatch();
}, [selectedMatchId]);

  const currentRound = rounds.find(
    (round) => round.id === roundId
  );

  useEffect(() => {
  async function loadTripPlayers() {
    const tripId = currentRound?.trip_id;

    if (!tripId) {
      setTripPlayerIds([]);
      return;
    }

    const { data, error } = await supabase
      .from("trip_players")
      .select("player_id")
      .eq("trip_id", tripId);

    if (error) {
      console.error(
        "Error loading trip players:",
        error
      );
      setTripPlayerIds([]);
      return;
    }

    setTripPlayerIds(
      (data || []).map((row) => row.player_id)
    );
  }

  loadTripPlayers();
}, [currentRound?.trip_id]);

  const roundPlayers = players.filter(
  (player) =>
    tripPlayerIds.includes(player.id)
);

const matchRounds = rounds.filter(
  (round) =>
    round.format === "Four-Ball" ||
    round.format === "Foursomes"
);

useEffect(() => {
  if (
    roundId &&
    !matchRounds.some((round) => round.id === roundId)
  ) {
    setRoundId("");
    setSideA1("");
    setSideA2("");
    setSideB1("");
    setSideB2("");
  }
}, [roundId, matchRounds]);

  const requiresPartners =
    matchType === "Best Ball" ||
    matchType === "Alt Shot";

  const usedPlayerIds = [
    sideA1,
    sideA2,
    sideB1,
    sideB2,
  ].filter(Boolean);

  const availablePlayers = (
    excludedIds: string[]
  ) =>
    roundPlayers.filter(
      (player) =>
        !excludedIds.includes(player.id)
    );

    async function loadBestBallScores(matchId: string) {
  const { data, error } = await supabase
    .from("best_ball_scores")
    .select("*")
    .eq("match_id", matchId)
    .order("hole_number", {
      ascending: true,
    });

  if (error) {
    console.error(error);
    setBestBallScores([]);
    return;
  }

  setBestBallScores(data || []);

  const inputValues: Record<string, string> = {};

  (data || []).forEach((score) => {
    inputValues[
      `${score.player_id}-${score.hole_number}`
    ] =
      score.gross_score == null
        ? ""
        : String(score.gross_score);
  });

  setBestBallInputs(inputValues);
}



  function getCourseHoleCount(
  courseId: string
): number {
  const course = courses.find(
    (item) => item.id === courseId
  );

  return Number(course?.holes) || 18;
}

function calculateMatchPoints(
  results: any[],
  totalHoles: number,
  matchStatus: string,
  pointSystem: "match" | "three_point"
) {
  let pointsA = 0;
  let pointsB = 0;

  const completedResults = results.filter(
  (item) =>
    item.result === "A" ||
    item.result === "B" ||
    item.result === "AS"
);

  const awardSegment = (
    segmentResults: any[]
  ) => {
    const sideAWins = segmentResults.filter(
      (item) => item.result === "A"
    ).length;

    const sideBWins = segmentResults.filter(
      (item) => item.result === "B"
    ).length;

    if (sideAWins > sideBWins) {
      pointsA += 1;
    } else if (sideBWins > sideAWins) {
      pointsB += 1;
    } else {
      pointsA += 0.5;
      pointsB += 0.5;
    }
  };

  if (pointSystem === "three_point") {
    const frontNine = completedResults.filter(
      (item) =>
        item.hole_number >= 1 &&
        item.hole_number <= 9
    );

    if (frontNine.length === 9) {
      awardSegment(frontNine);
    }

    if (totalHoles >= 18) {
      const backNine = completedResults.filter(
        (item) =>
          item.hole_number >= 10 &&
          item.hole_number <= 18
      );

      if (backNine.length === 9) {
        awardSegment(backNine);
      }
    }
  }

  const sideAWins =
    completedResults.filter(
      (item) => item.result === "A"
    ).length;

  const sideBWins =
    completedResults.filter(
      (item) => item.result === "B"
    ).length;

  const holesPlayed =
    completedResults.length;

  if (matchStatus.includes("A WINS")) {
    pointsA += 1;
  } else if (
    matchStatus.includes("B WINS")
  ) {
    pointsB += 1;
  } else if (
    holesPlayed >= totalHoles &&
    sideAWins === sideBWins
  ) {
    pointsA += 0.5;
    pointsB += 0.5;
  }

  return {
    pointsA,
    pointsB,
  };
}
  function calculateMatchStatus(
  results: any[],
  totalHoles: number
): {
  pointsA: number;
  pointsB: number;
  status: string;
} {
  const completedResults = results.filter(
    (result) =>
      result.result === "A" ||
      result.result === "B" ||
      result.result === "AS"
  );

  let pointsA = 0;
  let pointsB = 0;

  for (const result of completedResults) {
    if (result.result === "A") {
      pointsA += 1;
    }

    if (result.result === "B") {
      pointsB += 1;
    }
  }

  const holesPlayed =
    completedResults.length;

  const holesRemaining = Math.max(
    0,
    totalHoles - holesPlayed
  );

  const margin = Math.abs(
    pointsA - pointsB
  );

  // Match is mathematically complete.
  if (
    margin > holesRemaining &&
    margin > 0
  ) {
    const leader =
      pointsA > pointsB ? "A" : "B";

    return {
      pointsA,
      pointsB,
      status: `${leader} WINS ${margin} & ${holesRemaining}`,
    };
  }

  // All holes have been completed.
  if (holesRemaining === 0) {
    if (pointsA === pointsB) {
      return {
        pointsA,
        pointsB,
        status: "AS",
      };
    }

    const leader =
      pointsA > pointsB ? "A" : "B";

    return {
      pointsA,
      pointsB,
      status: `${leader} WINS ${margin} UP`,
    };
  }

  // Dormie: the leader is exactly as many up
  // as there are holes remaining.
  if (
    margin === holesRemaining &&
    margin > 0
  ) {
    const leader =
      pointsA > pointsB ? "A" : "B";

    return {
      pointsA,
      pointsB,
      status: `${leader} DORMIE`,
    };
  }

  if (pointsA === pointsB) {
    return {
      pointsA,
      pointsB,
      status: "AS",
    };
  }

  if (pointsA > pointsB) {
    return {
      pointsA,
      pointsB,
      status: `A ${margin} UP`,
    };
  }

  return {
    pointsA,
    pointsB,
    status: `B ${margin} UP`,
  };
}
function getStatusAfterHole(
  results: any[],
  holeIndex: number
): {
  status: string;
  leader: "A" | "B" | "AS";
} {
  let pointsA = 0;
  let pointsB = 0;

  const sortedResults = [...results].sort(
    (a, b) =>
      a.hole_number - b.hole_number
  );

  for (let i = 0; i <= holeIndex; i++) {
    const result = sortedResults[i]?.result;

    if (result === "A") {
      pointsA += 1;
    }

    if (result === "B") {
      pointsB += 1;
    }
  }

  if (pointsA === pointsB) {
    return {
      status: "AS",
      leader: "AS",
    };
  }

  const margin = Math.abs(
    pointsA - pointsB
  );

  if (pointsA > pointsB) {
    return {
      status: `${margin} UP`,
      leader: "A",
    };
  }

  return {
    status: `${margin} UP`,
    leader: "B",
  };
}
  function isMatchComplete(
  status: string,
  holesPlayed: number,
  totalHoles: number
): boolean {
  if (pointSystem === "three_point") {
    return holesPlayed >= totalHoles;
  }

  return status.includes("WINS");
}
  async function loadAltShotScores(
  matchId: string
) {
  const { data, error } = await supabase
    .from("match_side_hole_scores")
    .select("*")
    .eq("match_id", matchId)
    .order("hole_number", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error loading Alt Shot scores:",
      error
    );
    return;
  }

  setAltShotScores(data || []);
}
function getMatchSummary(
  match: any
) {
  const results =
    matchHoleResults.filter(
      (item) =>
        item.match_id === match.id &&
        (
          item.result === "A" ||
          item.result === "B" ||
          item.result === "AS"
        )
    );

  const holesPlayed = results.length;

  const round = rounds.find(
    (item) => item.id === match.round_id
  );

  const totalHoles = round
    ? getCourseHoleCount(round.course_id)
    : 18;

  const holesRemaining = Math.max(
    0,
    totalHoles - holesPlayed
  );

  return {
    holesPlayed,
    totalHoles,
    holesRemaining,
    pointsA: Number(match.points_a ?? 0),
    pointsB: Number(match.points_b ?? 0),
  };
}

async function loadSinglesScores(
  matchId: string
) {
  setErrorMessage("");

  const match = matches.find(
    (item) => item.id === matchId
  );

  if (!match) {
    return;
  }

  const round = rounds.find(
    (item) => item.id === match.round_id
  );

  if (!round) {
    return;
  }

  const { data: matchPlayers, error: playersError } =
    await supabase
      .from("match_players")
      .select("player_id, side")
      .eq("match_id", matchId);

  if (playersError) {
    console.error(
      "Error loading Singles match players:",
      playersError
    );
    return;
  }

  const sideAPlayer = matchPlayers?.find(
    (item) => item.side === "A"
  );

  const sideBPlayer = matchPlayers?.find(
    (item) => item.side === "B"
  );

  if (
    !sideAPlayer?.player_id ||
    !sideBPlayer?.player_id
  ) {
    setErrorMessage(
      "Singles match players are not configured correctly."
    );
    return;
  }

  const playerIds = [
    sideAPlayer.player_id,
    sideBPlayer.player_id,
  ];

  const { data: roundScores, error: scoresError } =
    await supabase
      .from("round_scores")
      .select("*")
      .eq("round_id", round.id)
      .in("player_id", playerIds)
      .order("hole_number", {
        ascending: true,
      });

  if (scoresError) {
    console.error(
      "Error loading Singles scorecards:",
      scoresError
    );
    return;
  }

  const {
  data: handicapRows,
  error: handicapError,
} = await supabase
  .from("round_player_handicaps")
  .select(
    "player_id, playing_handicap"
  )
  .eq("round_id", round.id);

if (handicapError) {
  console.error(
    "Error loading Singles round handicaps:",
    handicapError
  );
  return;
}

  const {
    data: courseHoles,
    error: holesError,
  } = await supabase
    .from("hole_information")
    .select("*")
    .eq("course_id", round.course_id)
    .order("hole_number", {
      ascending: true,
    });

  if (holesError) {
    console.error(
      "Error loading Singles holes:",
      holesError
    );
    return;
  }

  const sideAHandicap =
    handicapRows?.find(
      (item) =>
        item.player_id ===
        sideAPlayer.player_id
    )?.playing_handicap ?? 0;

  const sideBHandicap =
    handicapRows?.find(
      (item) =>
        item.player_id ===
        sideBPlayer.player_id
    )?.playing_handicap ?? 0;

  const {
    data: savedResults,
    error: savedResultsError,
  } = await supabase
    .from("match_hole_results")
    .select("*")
    .eq("match_id", matchId);

  if (savedResultsError) {
    console.error(
      "Error loading saved Singles results:",
      savedResultsError
    );
  }

  const calculatedResults =
    (courseHoles || []).map((hole) => {
      const concession =
        (savedResults || []).find(
          (item) =>
            item.hole_number ===
              hole.hole_number &&
            item.side_a_score === null &&
            item.side_b_score === null &&
            ["A", "B", "AS"].includes(
              item.result
            )
        );

      if (concession) {
        return concession;
      }

      const sideAScore =
        roundScores?.find(
          (score) =>
            score.player_id ===
              sideAPlayer.player_id &&
            score.hole_number ===
              hole.hole_number
        );

      const sideBScore =
        roundScores?.find(
          (score) =>
            score.player_id ===
              sideBPlayer.player_id &&
            score.hole_number ===
              hole.hole_number
        );

      if (
        sideAScore?.gross_score == null ||
        sideBScore?.gross_score == null
      ) {
        return {
          match_id: matchId,
          hole_number: hole.hole_number,
          side_a_score:
            sideAScore?.gross_score ?? null,
          side_b_score:
            sideBScore?.gross_score ?? null,
          side_a_net: null,
          side_b_net: null,
          result: null,
        };
      }

      const sideAStrokes =
        useHandicaps
          ? strokesOnHole(
              Number(sideAHandicap),
              hole.handicap_rank ?? 18
            )
          : 0;

      const sideBStrokes =
        useHandicaps
          ? strokesOnHole(
              Number(sideBHandicap),
              hole.handicap_rank ?? 18
            )
          : 0;

      const sideANet =
        Number(sideAScore.gross_score) -
        sideAStrokes;

      const sideBNet =
        Number(sideBScore.gross_score) -
        sideBStrokes;

      let result = "AS";

      if (sideANet < sideBNet) {
        result = "A";
      } else if (sideBNet < sideANet) {
        result = "B";
      }

      return {
        match_id: matchId,
        hole_number: hole.hole_number,
        side_a_score:
          Number(sideAScore.gross_score),
        side_b_score:
          Number(sideBScore.gross_score),
        side_a_net: sideANet,
        side_b_net: sideBNet,
        result,
      };
    });

  setMatchHoleResults(
  calculatedResults
);

const completedResults =
  calculatedResults.filter(
    (item) => item.result
  );

const totalHoles =
  courseHoles?.length || 18;

const status = calculateMatchStatus(
  completedResults,
  totalHoles
);

const { pointsA, pointsB } =
  calculateMatchPoints(
    completedResults,
    totalHoles,
    status.status,
    pointSystem
  );

const { error: updateError } =
  await supabase
    .from("matches")
    .update({
      status: status.status,
      points_a: pointsA,
      points_b: pointsB,
    })
    .eq("id", matchId);

if (updateError) {
  console.error(
    "Error updating Singles match:",
    updateError
  );
  return;
}

  setMatches((current) =>
  current.map((item) =>
    item.id === matchId
      ? {
          ...item,
          status: status.status,
          points_a: pointsA,
          points_b: pointsB,
        }
      : item
  )
);
}

  async function saveSinglesHole(
  matchId: string,
  holeNumber: number,
  sideAScore: number,
  sideBScore: number
) {
  const match = matches.find(
    (item) => item.id === matchId
  );

  if (!match) {
    setErrorMessage("Match not found.");
    return;
  }

  const round = rounds.find(
    (item) => item.id === match.round_id
  );

  if (!round) {
    setErrorMessage("Round not found.");
    return;
  }

  const courseId = round.course_id;

  const { data: hole, error: holeError } =
    await supabase
      .from("hole_information")
      .select("*")
      .eq("course_id", courseId)
      .eq("hole_number", holeNumber)
      .maybeSingle();

  if (holeError || !hole) {
    setErrorMessage(
      "Hole information could not be found."
    );
    return;
  }

  const { data: matchPlayers, error: playerError } =
    await supabase
      .from("match_players")
      .select("player_id, side")
      .eq("match_id", matchId);

  if (playerError) {
    console.error(playerError);
    setErrorMessage(playerError.message);
    return;
  }

  if (!matchPlayers || matchPlayers.length !== 2) {
    setErrorMessage(
      "Singles match must have exactly two players."
    );
    return;
  }

  const { data: handicaps, error: handicapError } =
    await supabase
      .from("match_player_handicaps")
      .select(
        "player_id, playing_handicap"
      )
      .eq("match_id", matchId);

  if (handicapError) {
    console.error(handicapError);
    setErrorMessage(
      handicapError.message
    );
    return;
  }

  const sideAPlayer = matchPlayers.find(
    (item) => item.side === "A"
  );

  const sideBPlayer = matchPlayers.find(
    (item) => item.side === "B"
  );

  if (!sideAPlayer || !sideBPlayer) {
    setErrorMessage(
      "The match sides are incomplete."
    );
    return;
  }

  const sideAHandicap =
    handicaps?.find(
      (item) =>
        item.player_id ===
        sideAPlayer.player_id
    )?.playing_handicap ?? 0;

  const sideBHandicap =
    handicaps?.find(
      (item) =>
        item.player_id ===
        sideBPlayer.player_id
    )?.playing_handicap ?? 0;

  const sideAStrokes = strokesOnHole(
    Number(sideAHandicap),
    Number(hole.handicap_rank)
  );

  const sideBStrokes = strokesOnHole(
    Number(sideBHandicap),
    Number(hole.handicap_rank)
  );

  const sideANet = useHandicaps
  ? sideAScore - sideAStrokes
  : sideAScore;

const sideBNet = useHandicaps
  ? sideBScore - sideBStrokes
  : sideBScore;

  const result =
    sideANet < sideBNet
      ? "A"
      : sideANet > sideBNet
        ? "B"
        : "AS";

  const { data, error } = await supabase
    .from("match_hole_results")
    .upsert(
      {
        match_id: matchId,
        hole_number: holeNumber,
        side_a_score: sideAScore,
        side_b_score: sideBScore,
        side_a_net_score: sideANet,
        side_b_net_score: sideBNet,
        result,
      },
      {
        onConflict:
          "match_id,hole_number",
      }
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error saving match hole:",
      error
    );
    setErrorMessage(error.message);
    return;
  }

  const updatedResults = [
    ...matchHoleResults.filter(
      (item) =>
        item.match_id !== matchId ||
        item.hole_number !== holeNumber
    ),
    data,
  ].sort(
    (a, b) =>
      a.hole_number - b.hole_number
  );

  setMatchHoleResults(updatedResults);

  const status =
  calculateMatchStatus(
    updatedResults,
    getCourseHoleCount(round.course_id)
  );

  const totalHoles =
  getCourseHoleCount(
    round.course_id
  );

const { pointsA, pointsB } =
  calculateMatchPoints(
    updatedResults,
    totalHoles,
    status.status,
    pointSystem
  );

const { error: matchError } =
  await supabase
    .from("matches")
    .update({
      points_a: pointsA,
      points_b: pointsB,
      status: status.status,
    })
    .eq("id", matchId);

  if (matchError) {
    console.error(
      "Error updating match:",
      matchError
    );
    setErrorMessage(
      matchError.message
    );
    return;
  }

  setMatches((current) =>
  current.map((item) =>
    item.id === matchId
      ? {
          ...item,
          points_a: pointsA,
          points_b: pointsB,
          status: status.status,
        }
      : item
  )
);

  setErrorMessage("");
}  
  async function saveBestBallHole(
  matchId: string,
  holeNumber: number,
  sideAGross1: number,
  sideAGross2: number,
  sideBGross1: number,
  sideBGross2: number
) {
  const match = matches.find(
    (item) => item.id === matchId
  );

  if (!match) {
    setErrorMessage("Match not found.");
    return;
  }

  const round = rounds.find(
    (item) => item.id === match.round_id
  );

  if (!round) {
    setErrorMessage("Round not found.");
    return;
  }

  const {
    data: hole,
    error: holeError,
  } = await supabase
    .from("hole_information")
    .select("*")
    .eq("course_id", round.course_id)
    .eq("hole_number", holeNumber)
    .maybeSingle();

  if (holeError || !hole) {
    setErrorMessage(
      "Hole information could not be found."
    );
    return;
  }

  const {
    data: matchPlayers,
    error: playerError,
  } = await supabase
    .from("match_players")
    .select("player_id, side, position")
    .eq("match_id", matchId)
    .order("side")
    .order("position");

  if (playerError) {
    console.error(playerError);
    setErrorMessage(playerError.message);
    return;
  }

  if (!matchPlayers || matchPlayers.length !== 4) {
    setErrorMessage(
      "Best Ball requires four players."
    );
    return;
  }

  const sideAPlayers = matchPlayers
    .filter((item) => item.side === "A")
    .sort(
      (a, b) =>
        Number(a.position) -
        Number(b.position)
    );

  const sideBPlayers = matchPlayers
    .filter((item) => item.side === "B")
    .sort(
      (a, b) =>
        Number(a.position) -
        Number(b.position)
    );

  if (
    sideAPlayers.length !== 2 ||
    sideBPlayers.length !== 2
  ) {
    setErrorMessage(
      "Best Ball requires two players on each side."
    );
    return;
  }

  const {
    data: handicaps,
    error: handicapError,
  } = await supabase
    .from("match_player_handicaps")
    .select(
      "player_id, playing_handicap"
    )
    .eq("match_id", matchId);

  if (handicapError) {
    console.error(handicapError);
    setErrorMessage(
      handicapError.message
    );
    return;
  }

  const getPlayerHandicap = (
    playerId: string
  ) =>
    Number(
      handicaps?.find(
        (item) =>
          item.player_id === playerId
      )?.playing_handicap ?? 0
    );

  const sideAHandicap1 =
    getPlayerHandicap(
      sideAPlayers[0].player_id
    );

  const sideAHandicap2 =
    getPlayerHandicap(
      sideAPlayers[1].player_id
    );

  const sideBHandicap1 =
    getPlayerHandicap(
      sideBPlayers[0].player_id
    );

  const sideBHandicap2 =
    getPlayerHandicap(
      sideBPlayers[1].player_id
    );

  const sideAStrokes1 = strokesOnHole(
    sideAHandicap1,
    Number(hole.handicap_rank)
  );

  const sideAStrokes2 = strokesOnHole(
    sideAHandicap2,
    Number(hole.handicap_rank)
  );

  const sideBStrokes1 = strokesOnHole(
    sideBHandicap1,
    Number(hole.handicap_rank)
  );

  const sideBStrokes2 = strokesOnHole(
    sideBHandicap2,
    Number(hole.handicap_rank)
  );

  const sideANet1 = useHandicaps
    ? sideAGross1 - sideAStrokes1
    : sideAGross1;

  const sideANet2 = useHandicaps
    ? sideAGross2 - sideAStrokes2
    : sideAGross2;

  const sideBNet1 = useHandicaps
    ? sideBGross1 - sideBStrokes1
    : sideBGross1;

  const sideBNet2 = useHandicaps
    ? sideBGross2 - sideBStrokes2
    : sideBGross2;

  /*
   * Best Ball:
   * The lower net score on each side counts.
   */

  const sideACountingPlayer =
    sideANet1 <= sideANet2
      ? sideAPlayers[0]
      : sideAPlayers[1];

  const sideBCountingPlayer =
    sideBNet1 <= sideBNet2
      ? sideBPlayers[0]
      : sideBPlayers[1];

  const sideANet =
    Math.min(
      sideANet1,
      sideANet2
    );

  const sideBNet =
    Math.min(
      sideBNet1,
      sideBNet2
    );

  const sideAGross =
    sideANet1 <= sideANet2
      ? sideAGross1
      : sideAGross2;

  const sideBGross =
    sideBNet1 <= sideBNet2
      ? sideBGross1
      : sideBGross2;

  const result =
    sideANet < sideBNet
      ? "A"
      : sideANet > sideBNet
        ? "B"
        : "AS";

  /*
   * Save the four individual Best Ball
   * scores separately from Scorecards.
   */
  const scoreRows = [
    {
      match_id: matchId,
      player_id:
        sideAPlayers[0].player_id,
      hole_number: holeNumber,
      gross_score: sideAGross1,
    },
    {
      match_id: matchId,
      player_id:
        sideAPlayers[1].player_id,
      hole_number: holeNumber,
      gross_score: sideAGross2,
    },
    {
      match_id: matchId,
      player_id:
        sideBPlayers[0].player_id,
      hole_number: holeNumber,
      gross_score: sideBGross1,
    },
    {
      match_id: matchId,
      player_id:
        sideBPlayers[1].player_id,
      hole_number: holeNumber,
      gross_score: sideBGross2,
    },
  ];

  const {
    data: savedScores,
    error: scoreError,
  } = await supabase
    .from("best_ball_scores")
    .upsert(scoreRows, {
      onConflict:
        "match_id,player_id,hole_number",
    })
    .select();

  if (scoreError) {
    console.error(
      "Best Ball save error:",
      scoreError
    );

    setErrorMessage(
      `Best Ball save failed: ${scoreError.message}`
    );

    return;
  }

  console.log(
    "Best Ball scores saved:",
    savedScores
  );

  /*
   * Save the Best Ball result for this hole.
   */
  const {
    data,
    error,
  } = await supabase
    .from("match_hole_results")
    .upsert(
      {
        match_id: matchId,
        hole_number: holeNumber,

        side_a_score: sideAGross,
        side_b_score: sideBGross,

        side_a_net_score: sideANet,
        side_b_net_score: sideBNet,

        side_a_counting_player_id:
          sideACountingPlayer.player_id,

        side_b_counting_player_id:
          sideBCountingPlayer.player_id,

        result,
      },
      {
        onConflict:
          "match_id,hole_number",
      }
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error saving Best Ball hole result:",
      error
    );

    setErrorMessage(error.message);
    return;
  }

  /*
   * Update the local Best Ball input state.
   */
  setBestBallInputs((current) => ({
    ...current,

    [`${sideAPlayers[0].player_id}-${holeNumber}`]:
      String(sideAGross1),

    [`${sideAPlayers[1].player_id}-${holeNumber}`]:
      String(sideAGross2),

    [`${sideBPlayers[0].player_id}-${holeNumber}`]:
      String(sideBGross1),

    [`${sideBPlayers[1].player_id}-${holeNumber}`]:
      String(sideBGross2),
  }));

  /*
   * Update the visible hole results.
   */
  const updatedResults = [
    ...matchHoleResults.filter(
      (item) =>
        item.match_id !== matchId ||
        item.hole_number !== holeNumber
    ),
    data,
  ].sort(
    (a, b) =>
      a.hole_number - b.hole_number
  );

  setMatchHoleResults(updatedResults);

  /*
 * Recalculate the match status and points.
 */
const totalHoles =
  getCourseHoleCount(
    round.course_id
  );

const status =
  calculateMatchStatus(
    updatedResults,
    totalHoles
  );

const { pointsA, pointsB } =
  calculateMatchPoints(
    updatedResults,
    totalHoles,
    status.status,
    pointSystem
  );

const {
  data: updatedMatch,
  error: matchError,
} = await supabase
  .from("matches")
  .update({
    points_a: pointsA,
    points_b: pointsB,
    status: status.status,
  })
  .eq("id", matchId)
  .select("id, points_a, points_b, status");

  if (matchError) {
    console.error(
      "Error updating match:",
      matchError
    );

    setErrorMessage(
      matchError.message
    );

    return;
  }


  setMatches((current) =>
  current.map((item) =>
    item.id === matchId
      ? {
          ...item,
          points_a: pointsA,
          points_b: pointsB,
          status: status.status,
        }
      : item
  )
);

  setErrorMessage("");
  setSuccessMessage(
    "Best Ball hole saved."
  );
}

  async function saveAltShotHole(
  matchId: string,
  holeNumber: number,
  sideAGross: number,
  sideBGross: number
) {
  const match = matches.find(
    (item) => item.id === matchId
  );

  if (!match) {
    setErrorMessage("Match not found.");
    return;
  }

  const round = rounds.find(
    (item) => item.id === match.round_id
  );

  if (!round) {
    setErrorMessage("Round not found.");
    return;
  }

  const {
    data: matchPlayers,
    error: playerError,
  } = await supabase
    .from("match_players")
    .select("player_id, side")
    .eq("match_id", matchId);

  if (playerError) {
    setErrorMessage(playerError.message);
    return;
  }

  if (
    !matchPlayers ||
    matchPlayers.length !== 4
  ) {
    setErrorMessage(
      "Alt Shot requires four players."
    );
    return;
  }

  const { data: hole, error: holeError } =
    await supabase
      .from("hole_information")
      .select("handicap_rank")
      .eq("course_id", round.course_id)
      .eq("hole_number", holeNumber)
      .maybeSingle();

  if (holeError || !hole) {
    setErrorMessage(
      "Hole information could not be found."
    );
    return;
  }

  const {
  data: sideHandicaps,
  error: handicapError,
} = await supabase
  .from("match_side_handicaps")
  .select("side, playing_handicap")
  .eq("match_id", matchId);

if (handicapError) {
  console.error(handicapError);
  setErrorMessage(
    handicapError.message
  );
  return;
}

  const sideAHandicap = Number(
  sideHandicaps?.find(
    (item) => item.side === "A"
  )?.playing_handicap ?? 0
);

  const sideBHandicap = Number(
  sideHandicaps?.find(
    (item) => item.side === "B"
  )?.playing_handicap ?? 0
);

  const sideAStrokes = strokesOnHole(
    sideAHandicap,
    Number(hole.handicap_rank)
  );

  const sideBStrokes = strokesOnHole(
    sideBHandicap,
    Number(hole.handicap_rank)
  );

  const sideANet = useHandicaps
  ? sideAGross - sideAStrokes
  : sideAGross;

const sideBNet = useHandicaps
  ? sideBGross - sideBStrokes
  : sideBGross;

  const result =
    sideANet < sideBNet
      ? "A"
      : sideANet > sideBNet
        ? "B"
        : "AS";

  const sideScoreRows = [
    {
      match_id: matchId,
      hole_number: holeNumber,
      side: "A",
      gross_score: sideAGross,
    },
    {
      match_id: matchId,
      hole_number: holeNumber,
      side: "B",
      gross_score: sideBGross,
    },
  ];
  setAltShotScores((current) => {
  const withoutCurrent = current.filter(
    (item) =>
      item.match_id !== matchId ||
      item.hole_number !== holeNumber
  );

  return [
    ...withoutCurrent,
    ...sideScoreRows,
  ].sort(
    (a, b) =>
      a.hole_number - b.hole_number
  );
});

  const {
    error: sideScoreError,
  } = await supabase
    .from("match_side_hole_scores")
    .upsert(sideScoreRows, {
      onConflict:
        "match_id,hole_number,side",
    });

  if (sideScoreError) {
    console.error(sideScoreError);
    setErrorMessage(
      sideScoreError.message
    );
    return;
  }

  const { data, error } = await supabase
    .from("match_hole_results")
    .upsert(
      {
        match_id: matchId,
        hole_number: holeNumber,
        side_a_score: sideAGross,
        side_b_score: sideBGross,
        side_a_net_score: sideANet,
        side_b_net_score: sideBNet,
        result,
      },
      {
        onConflict:
          "match_id,hole_number",
      }
    )
    .select("*")
    .single();

  if (error) {
    console.error(error);
    setErrorMessage(error.message);
    return;
  }

  const updatedResults = [
    ...matchHoleResults.filter(
      (item) =>
        item.match_id !== matchId ||
        item.hole_number !== holeNumber
    ),
    data,
  ].sort(
    (a, b) =>
      a.hole_number - b.hole_number
  );

  setMatchHoleResults(updatedResults);

  const totalHoles =
  getCourseHoleCount(
    round.course_id
  );

const status =
  calculateMatchStatus(
    updatedResults,
    totalHoles
  );

const { pointsA, pointsB } =
  calculateMatchPoints(
    updatedResults,
    totalHoles,
    status.status,
    pointSystem
  );

const { error: matchError } =
  await supabase
    .from("matches")
    .update({
      points_a: pointsA,
      points_b: pointsB,
      status: status.status,
    })
    .eq("id", matchId);

  if (matchError) {
    setErrorMessage(
      matchError.message
    );
    return;
  }

  setMatches((current) =>
  current.map((item) =>
    item.id === matchId
      ? {
          ...item,
          points_a: pointsA,
          points_b: pointsB,
          status: status.status,
        }
      : item
  )
);

  setErrorMessage("");
}
async function deleteMatch(
  matchId: string
) {
  const match = matches.find(
    (item) => item.id === matchId
  );

  if (!match) {
    return;
  }

  const confirmed = window.confirm(
    `Delete Match ${match.match_number || ""}?\n\n` +
    `This will delete the match players, handicaps, hole scores, and match results.`
  );

  if (!confirmed) {
    return;
  }

  setErrorMessage("");
  setSaving(true);

  try {
    const { error: holeResultError } =
      await supabase
        .from("match_hole_results")
        .delete()
        .eq("match_id", matchId);

    if (holeResultError) {
      throw holeResultError;
    }

    const { error: sideScoreError } =
      await supabase
        .from("match_side_hole_scores")
        .delete()
        .eq("match_id", matchId);

    if (sideScoreError) {
      throw sideScoreError;
    }

    const { error: sideHandicapError } =
      await supabase
        .from("match_side_handicaps")
        .delete()
        .eq("match_id", matchId);

    if (sideHandicapError) {
      throw sideHandicapError;
    }

    const { error: playerHandicapError } =
      await supabase
        .from("match_player_handicaps")
        .delete()
        .eq("match_id", matchId);

    if (playerHandicapError) {
      throw playerHandicapError;
    }

    const { error: matchPlayersError } =
      await supabase
        .from("match_players")
        .delete()
        .eq("match_id", matchId);

    if (matchPlayersError) {
      throw matchPlayersError;
    }

    const { error: matchDeleteError } =
  await supabase
    .from("matches")
    .delete()
    .eq("id", matchId);

if (matchDeleteError) {
  throw matchDeleteError;
}

    setMatches((current) =>
      current.filter(
        (item) => item.id !== matchId
      )
    );

    setMatchHandicaps((current) =>
      current.filter(
        (item) => item.match_id !== matchId
      )
    );

    setMatchHoleResults((current) =>
      current.filter(
        (item) => item.match_id !== matchId
      )
    );

    setAltShotScores((current) =>
      current.filter(
        (item) => item.match_id !== matchId
      )
    );

    setBestBallScores((current) =>
      current.filter(
        (item) => item.match_id !== matchId
      )
    );

    setBestBallInputs({});

    if (selectedMatchId === matchId) {
      setSelectedMatchId(null);
    }

    setErrorMessage("");
  } catch (error: any) {
    console.error(
      "Error deleting match:",
      error
    );

    setErrorMessage(
      error?.message ||
        "Unable to delete match."
    );
  } finally {
    setSaving(false);
  }
}
  async function concedeMatchHole(
  matchId: string,
  holeNumber: number,
  winningSide: "A" | "B"
) {
  const result = winningSide;

  const { data, error } = await supabase
    .from("match_hole_results")
    .upsert(
      {
        match_id: matchId,
        hole_number: holeNumber,
        side_a_score: null,
        side_b_score: null,
        side_a_net_score: null,
        side_b_net_score: null,
        result,
      },
      {
        onConflict:
          "match_id,hole_number",
      }
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error saving conceded hole:",
      error
    );
    setErrorMessage(error.message);
    return;
  }

  const updatedResults = [
    ...matchHoleResults.filter(
      (item) =>
        item.match_id !== matchId ||
        item.hole_number !== holeNumber
    ),
    data,
  ].sort(
    (a, b) =>
      a.hole_number - b.hole_number
  );

  setMatchHoleResults(updatedResults);

  const match = matches.find(
    (item) => item.id === matchId
  );

  if (!match) {
    setErrorMessage("Match not found.");
    return;
  }

  const round = rounds.find(
    (item) => item.id === match.round_id
  );

  if (!round) {
    setErrorMessage("Round not found.");
    return;
  }

  const totalHoles =
  getCourseHoleCount(
    round.course_id
  );

const status =
  calculateMatchStatus(
    updatedResults,
    totalHoles
  );

const { pointsA, pointsB } =
  calculateMatchPoints(
    updatedResults,
    totalHoles,
    status.status,
    pointSystem
  );

const { data: updatedMatch, error: matchError } =
  await supabase
    .from("matches")
    .update({
      points_a: pointsA,
      points_b: pointsB,
      status: status.status,
    })
    .eq("id", matchId)
.select("id, points_a, points_b, status");

  if (matchError) {
    console.error(matchError);
    setErrorMessage(
      matchError.message
    );
    return;
  }

  console.log(
  "MATCH SAVED TO SUPABASE:",
  updatedMatch
);

  setMatches((current) =>
  current.map((item) =>
    item.id === matchId
      ? {
          ...item,
          points_a: pointsA,
          points_b: pointsB,
          status: status.status,
        }
      : item
  )
);

  setErrorMessage("");
}
  async function calculateMatchHandicaps(
  match: any
) {
  setErrorMessage("");

  const round = rounds.find(
    (item) => item.id === match.round_id
  );

  if (!round) {
    setErrorMessage(
      "The match's round could not be found."
    );
    return;
  }

  const tee = await supabase
    .from("course_tees")
    .select("*")
    .eq("id", round.tee_id)
    .maybeSingle();

  if (tee.error || !tee.data) {
    setErrorMessage(
      "The match's tee could not be found."
    );
    return;
  }

  if (
    tee.data.rating === null ||
    tee.data.slope === null ||
    tee.data.par === null
  ) {
    setErrorMessage(
      "The selected tee needs rating, slope and par."
    );
    return;
  }

  const { data: matchPlayers, error } =
    await supabase
      .from("match_players")
      .select(`
        *,
        players (
          id,
          first_name,
          last_name,
          handicap
        )
      `)
      .eq("match_id", match.id)
      .order("side")
      .order("position");

  if (error) {
    console.error(error);
    setErrorMessage(error.message);
    return;
  }

  if (!matchPlayers || matchPlayers.length === 0) {
    setErrorMessage(
      "No players are assigned to this match."
    );
    return;
  }

  const courseHandicaps = matchPlayers.map(
    (entry: any) => {
      const handicapIndex =
        Number(entry.players?.handicap ?? 0);

      const courseHandicap =
        calculateCourseHandicap(
          handicapIndex,
          Number(tee.data.slope),
          Number(tee.data.rating),
          Number(tee.data.par)
        );

      return {
        ...entry,
        course_handicap: courseHandicap,
      };
    }
  );

  let calculatedRows: any[] = [];

  if (match.match_type === "Singles") {
    const lowest = Math.min(
      ...courseHandicaps.map(
        (item) => item.course_handicap
      )
    );

    calculatedRows = courseHandicaps.map(
      (item) => ({
        match_id: match.id,
        player_id: item.player_id,
        course_handicap:
          Number(
            item.course_handicap.toFixed(2)
          ),
        playing_handicap: Math.round(
          item.course_handicap - lowest
        ),
      })
    );
  }

  if (match.match_type === "Best Ball") {
    const lowest = Math.min(
      ...courseHandicaps.map(
        (item) => item.course_handicap
      )
    );

    calculatedRows = courseHandicaps.map(
      (item) => ({
        match_id: match.id,
        player_id: item.player_id,
        course_handicap:
          Number(
            item.course_handicap.toFixed(2)
          ),
        playing_handicap: Math.round(
          (item.course_handicap - lowest) *
            0.9
        ),
      })
    );
  }

  if (match.match_type === "Alt Shot") {
  const sideA = courseHandicaps
    .filter(
      (item) => item.side === "A"
    )
    .reduce(
      (total, item) =>
        total + item.course_handicap,
      0
    );

  const sideB = courseHandicaps
    .filter(
      (item) => item.side === "B"
    )
    .reduce(
      (total, item) =>
        total + item.course_handicap,
      0
    );

  const lowerSide = Math.min(
    sideA,
    sideB
  );

  const sideADifference =
    Math.max(0, sideA - lowerSide);

  const sideBDifference =
    Math.max(0, sideB - lowerSide);

  const sideAPlaying = Math.round(
    sideADifference * 0.5
  );

  const sideBPlaying = Math.round(
    sideBDifference * 0.5
  );

  const {
    error: sideDeleteError,
  } = await supabase
    .from("match_side_handicaps")
    .delete()
    .eq("match_id", match.id);

  if (sideDeleteError) {
    console.error(sideDeleteError);
    setErrorMessage(
      sideDeleteError.message
    );
    return;
  }

  const {
    data: sideData,
    error: sideInsertError,
  } = await supabase
    .from("match_side_handicaps")
    .insert([
      {
        match_id: match.id,
        side: "A",
        combined_course_handicap:
          Number(sideA.toFixed(2)),
        playing_handicap:
          sideAPlaying,
      },
      {
        match_id: match.id,
        side: "B",
        combined_course_handicap:
          Number(sideB.toFixed(2)),
        playing_handicap:
          sideBPlaying,
      },
    ])
    .select("*");

  if (sideInsertError) {
    console.error(sideInsertError);
    setErrorMessage(
      sideInsertError.message
    );
    return;
  }

  setMatchHandicaps((current) => [
  ...current.filter(
    (item) => item.match_id !== match.id
  ),
  ...(sideData || []),
]);

setErrorMessage("");
setSuccessMessage(match.id);

setTimeout(() => {
  setSuccessMessage("");
}, 3000);

return;
}

  if (calculatedRows.length === 0) {
    setErrorMessage(
      "Unsupported match type."
    );
    alert("Alt Shot side handicaps calculated.")
    return;
  }

  const { error: deleteError } =
    await supabase
      .from("match_player_handicaps")
      .delete()
      .eq("match_id", match.id);

  if (deleteError) {
    console.error(deleteError);
    setErrorMessage(deleteError.message);
    return;
  }

  const { data, error: insertError } =
    await supabase
      .from("match_player_handicaps")
      .insert(calculatedRows)
      .select("*");

  if (insertError) {
    console.error(insertError);
    setErrorMessage(insertError.message);
    return;
  }

  setMatchHandicaps((current) => [
    ...current.filter(
      (item) => item.match_id !== match.id
    ),
    ...(data || []),
  ]);

  setErrorMessage("");

  alert(
    `Match handicaps calculated for ${calculatedRows.length} players.`
  );
}
  async function createMatch() {
    setErrorMessage("");

    if (!roundId) {
      setErrorMessage("Please select a round.");
      return;
    }

    if (matchType !== "Best Ball" && matchType !== "Alt Shot") {
  setErrorMessage("Match Type must be Best Ball or Alt Shot.");
  return;
}

if (
  (matchType === "Best Ball" &&
    currentRound?.format !== "Four-Ball") ||
  (matchType === "Alt Shot" &&
    currentRound?.format !== "Foursomes")
) {
  setErrorMessage(
    "Best Ball matches require a Four-Ball round, and Alt Shot matches require a Foursomes round."
  );
  return;
}

    if (!sideA1 || !sideB1) {
      setErrorMessage(
        "Both sides need a player."
      );
      return;
    }

    if (
      requiresPartners &&
      (!sideA2 || !sideB2)
    ) {
      setErrorMessage(
        "This format requires two players on each side."
      );
      return;
    }

    setSaving(true);

    const { count } = await supabase
      .from("matches")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("round_id", roundId);

    const nextMatchNumber =
      (count || 0) + 1;

    const { data: match, error } =
      await supabase
        .from("matches")
        .insert({
          round_id: roundId,
          player_a: sideA1,
          player_b: sideB1,
          match_type: matchType,
          status: "Scheduled",
          points_a: 0,
          points_b: 0,
        })
        .select("*")
        .single();

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    const matchPlayers = [
      {
        match_id: match.id,
        player_id: sideA1,
        side: "A",
        position: 1,
      },
      {
        match_id: match.id,
        player_id: sideB1,
        side: "B",
        position: 1,
      },
    ];

    if (requiresPartners) {
      matchPlayers.push(
        {
          match_id: match.id,
          player_id: sideA2,
          side: "A",
          position: 2,
        },
        {
          match_id: match.id,
          player_id: sideB2,
          side: "B",
          position: 2,
        }
      );
    }

    const {
      error: playerError,
    } = await supabase
      .from("match_players")
      .insert(matchPlayers);

    if (playerError) {
      console.error(playerError);

      await supabase
        .from("matches")
        .delete()
        .eq("id", match.id);

      setErrorMessage(
        playerError.message
      );
      setSaving(false);
      return;
    }

    setMatches((current) => [
      ...current,
      {
        ...match,
        match_number: nextMatchNumber,
      },
    ]);

    setRoundId("");
    setMatchType("Best Ball");
    setSideA1("");
    setSideA2("");
    setSideB1("");
    setSideB2("");
    setShowForm(false);
    setSaving(false);
  }
  function altShotTeeOffName(
  match: any,
  holeNumber: number,
  side: "A" | "B"
): string {
  const sidePlayers = (
    matchPlayersMap[match.id] || []
  )
    .filter(
      (player: any) =>
        player.side === side
    )
    .sort(
      (a: any, b: any) =>
        a.position - b.position
    );

  if (sidePlayers.length !== 2) {
    return "Starter not set";
  }

  const startPosition =
    side === "A"
      ? Number(
          match.side_a_start_position ?? 1
        )
      : Number(
          match.side_b_start_position ?? 1
        );

  const startIndex =
    startPosition === 2 ? 1 : 0;

  const playerIndex =
    (startIndex + (holeNumber - 1)) % 2;

  const player =
    sidePlayers[playerIndex];

  return player
    ? playerName(player.player_id)
    : "Starter not set";
}
  function getAltShotScore(
  matchId: string,
  holeNumber: number,
  side: "A" | "B"
): number | "" {
  const score = altShotScores.find(
    (item) =>
      item.match_id === matchId &&
      item.hole_number === holeNumber &&
      item.side === side
  );

  return score?.gross_score ?? "";
}
function getBestBallInputValue(
  playerId: string | undefined,
  holeNumber: number
): string {
  if (!playerId) {
    return "";
  }

  return (
    bestBallInputs[
      `${playerId}-${holeNumber}`
    ] ?? ""
  );
}
  function getBestBallScore(
  playerId: string,
  holeNumber: number
): number | "" {
  const score = bestBallScores.find(
    (item) =>
      item.player_id === playerId &&
      item.hole_number === holeNumber
  );

  return score?.gross_score ?? "";
}

function matchSideNames(
  matchId: string,
  side: "A" | "B"
): string {
  const sidePlayers = (
    matchPlayersMap[matchId] || []
  )
    .filter(
      (player: any) =>
        player.side === side
    )
    .sort(
      (a: any, b: any) =>
        a.position - b.position
    );

  if (sidePlayers.length === 0) {
    return `Side ${side}`;
  }

  return sidePlayers
    .map((player: any) =>
      playerName(player.player_id)
    )
    .join(" / ");
}
  function playerName(playerId: string) {
    const player = players.find(
      (item) => item.id === playerId
    );

    return player
      ? `${player.first_name} ${player.last_name}`
      : "Unknown player";
  }

  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Matches</h2>
          <p>
            Pair players and manage live match
            results.
          </p>
        </div>

        {userRole === "admin" && (
  <button
    className="primary"
    onClick={() => setShowForm(true)}
  >
    <Plus size={17} />
    Create match
  </button>
)}
      </div>

      {userRole === "admin" && showForm && (
  <div className="card compose">
          <div className="cardHead">
            <h3>Create Match</h3>

            <button
              className="icon"
              onClick={() =>
                setShowForm(false)
              }
            >
              <X size={18} />
            </button>
          </div>

          <label>
            Round
            <select
              value={roundId}
              onChange={(e) => {
  const selectedRoundId = e.target.value;
  setRoundId(selectedRoundId);

  const selectedRound = matchRounds.find(
    (round) => round.id === selectedRoundId
  );

  if (selectedRound?.format === "Four-Ball") {
    setMatchType("Best Ball");
  }

  if (selectedRound?.format === "Foursomes") {
    setMatchType("Alt Shot");
  }

  setSideA1("");
  setSideA2("");
  setSideB1("");
  setSideB2("");
}}
            >
              <option value="">
                Select round...
              </option>

              {matchRounds.map((round) => (
                <option
                  key={round.id}
                  value={round.id}
                >
                  Round {round.round_number}
                </option>
              ))}
            </select>
          </label>

          <label>
  Match Type
  <select
    value={matchType}
    onChange={(e) => {
      setMatchType(e.target.value);
      setSideA2("");
      setSideB2("");
    }}
  >
    <option value="Best Ball">
      Best Ball
    </option>
    <option value="Alt Shot">
      Alt Shot
    </option>
  </select>
</label>

          <div className="card">
            <h3>Side A</h3>

            <label>
              Player 1
              <select
                value={sideA1}
                onChange={(e) =>
                  setSideA1(e.target.value)
                }
                disabled={!roundId}
              >
                <option value="">
                  Select player...
                </option>

                {availablePlayers(
                  usedPlayerIds.filter(
                    (id) => id !== sideA1
                  )
                ).map((player) => (
                  <option
                    key={player.id}
                    value={player.id}
                  >
                    {player.first_name}{" "}
                    {player.last_name}
                  </option>
                ))}
              </select>
            </label>

            {requiresPartners && (
              <label>
                Player 2
                <select
                  value={sideA2}
                  onChange={(e) =>
                    setSideA2(e.target.value)
                  }
                  disabled={!roundId}
                >
                  <option value="">
                    Select player...
                  </option>

                  {availablePlayers(
                    usedPlayerIds.filter(
                      (id) => id !== sideA2
                    )
                  ).map((player) => (
                    <option
                      key={player.id}
                      value={player.id}
                    >
                      {player.first_name}{" "}
                      {player.last_name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="card">
            <h3>Side B</h3>

            <label>
              Player 1
              <select
                value={sideB1}
                onChange={(e) =>
                  setSideB1(e.target.value)
                }
                disabled={!roundId}
              >
                <option value="">
                  Select player...
                </option>

                {availablePlayers(
                  usedPlayerIds.filter(
                    (id) => id !== sideB1
                  )
                ).map((player) => (
                  <option
                    key={player.id}
                    value={player.id}
                  >
                    {player.first_name}{" "}
                    {player.last_name}
                  </option>
                ))}
              </select>
            </label>

            {requiresPartners && (
              <label>
                Player 2
                <select
                  value={sideB2}
                  onChange={(e) =>
                    setSideB2(e.target.value)
                  }
                  disabled={!roundId}
                >
                  <option value="">
                    Select player...
                  </option>

                  {availablePlayers(
                    usedPlayerIds.filter(
                      (id) => id !== sideB2
                    )
                  ).map((player) => (
                    <option
                      key={player.id}
                      value={player.id}
                    >
                      {player.first_name}{" "}
                      {player.last_name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {errorMessage && (
            <div className="attention">
              <p>⚠ {errorMessage}</p>
            </div>
          )}

          <button
            className="primary"
            onClick={createMatch}
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Match"}
          </button>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="card">
          <p
            style={{
              color: "#879087",
              fontSize: "12px",
            }}
          >
            No matches have been created yet.
          </p>
        </div>
      ) : (
        <div className="cards">
          {matches.map((match, index) => {
            const round = rounds.find(
              (item) =>
                item.id === match.round_id
            );

            const matchResults =
  matchHoleResults.filter(
    (item) =>
      item.match_id === match.id &&
      (
        item.result === "A" ||
        item.result === "B" ||
        item.result === "AS"
      )
  );

const holesPlayed =
  matchResults.length;

const totalHoles =
  getCourseHoleCount(
    round?.course_id
  );

            return (
              <Card
                title={`Match ${
                  match.match_number ||
                  index + 1
                }`}
                key={match.id}
              >
                <div className="match">
  <div>
    <b>
      {playerName(match.player_a)}
    </b>

    <span>
      {match.match_type}
    </span>

    <b>
      {playerName(match.player_b)}
    </b>

    <small>
      {round
        ? `Round ${round.round_number}`
        : "Round"}
    </small>
  </div>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "8px",
    }}
  >
    <strong
      className={
        match.status === "Live"
          ? "live"
          : ""
      }
    >
      {match.status}
    </strong>

    {userRole === "admin" &&
  useHandicaps &&
  match.match_type !== "Singles" && (
  <button
    className="primary"
    onClick={() =>
      calculateMatchHandicaps(match)
    }
    disabled={saving}
  >
    {saving
      ? "Calculating..."
      : "Calculate Handicaps"}
  </button>
)}

    {userRole === "admin" && (
  <button
    className="link"
    onClick={() =>
      deleteMatch(match.id)
    }
    disabled={saving}
  >
    Delete
  </button>
)}
    {successMessage === match.id && (
  <div
    style={{
      fontSize: "11px",
      color: "#2f6b35",
      marginTop: "4px",
    }}
  >
    ✓ {match.match_type === "Alt Shot"
  ? "Alt Shot side handicaps calculated successfully."
  : "Match handicaps calculated successfully."}
  </div>
)}
  </div>
</div>

<button
  className="link"
  onClick={async () => {
  setSelectedMatchId(match.id);

  if (match.match_type === "Singles") {
    await loadSinglesScores(match.id);
    return;
  }

  await loadMatchHoleResults(match.id);

  if (match.match_type === "Best Ball") {
    await loadBestBallScores(match.id);
  }

  if (match.match_type === "Alt Shot") {
    await loadAltShotScores(match.id);
  }
}}
>
  {match.match_type === "Singles"
    ? "View Scorecard Results"
    : "Score Match"}{" "}
  <ChevronRight size={15} />
</button>
{selectedMatchId === match.id && (
  <div
    className="card"
    style={{ marginTop: "15px" }}
  >
    <div className="cardHead">
      <div>
        <h3>
          Match {match.match_number || index + 1}
        </h3>

        <p
          style={{
            margin: "4px 0 0",
            color: "#879087",
            fontSize: "11px",
          }}
        >
          {match.match_type}
        </p>
        <p
  style={{
    margin: "4px 0 0",
    color: "#879087",
    fontSize: "11px",
  }}
>
  {matchSideNames(match.id, "A")}
  {"  vs  "}
  {matchSideNames(match.id, "B")}
</p>
      </div>

      <strong>
  {match.status === "AS"
    ? "AS"
    : match.status?.startsWith("A")
      ? match.status.replace(
          /^A/,
          matchSideNames(match.id, "A")
        )
      : match.status?.startsWith("B")
        ? match.status.replace(
            /^B/,
            matchSideNames(match.id, "B")
          )
        : match.status}
</strong>
    </div>
    {(() => {
  const summary =
    getMatchSummary(match);

  return (
    <div
      style={{
        marginTop: "12px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        <div className="stat">
          <b>
            {match.points_a || 0} -{" "}
            {match.points_b || 0}
          </b>
          <span>Match Score</span>
        </div>

        <div className="stat">
          <b>
            {summary.holesPlayed}
          </b>
          <span>Through</span>
        </div>

        <div className="stat">
          <b>
            {summary.holesRemaining}
          </b>
          <span>Remaining</span>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "10px",
          fontSize: "11px",
          color: "#879087",
        }}
      >
        {summary.holesPlayed === 0
          ? "Match not started"
          : `${summary.holesRemaining} ${
              summary.holesRemaining === 1
                ? "hole"
                : "holes"
            } remaining`}
      </div>
    </div>
  );
})()}
{matchHoleResults.filter(
  (item) => item.match_id === match.id
).length > 0 && (
  <div
    style={{
      marginTop: "12px",
      paddingTop: "12px",
      borderTop: "1px solid #edf0ec",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        color: "#879087",
        marginBottom: "8px",
      }}
    >
      Hole Results
    </div>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
      }}
    >
      {matchHoleResults.filter(
  (item) => item.match_id === match.id
).length > 0 && (
  <div
    style={{
      marginTop: "12px",
      paddingTop: "12px",
      borderTop:
        "1px solid #edf0ec",
    }}
  >
    <div
      style={{
        fontSize: "11px",
        color: "#879087",
        marginBottom: "8px",
      }}
    >
      Match Progress
    </div>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
      }}
    >
      {matchHoleResults
        .filter(
          (item) =>
            item.match_id === match.id
        )
        .sort(
          (a, b) =>
            a.hole_number -
            b.hole_number
        )
        .map((item, index, sortedResults) => {
          const cumulative =
            getStatusAfterHole(
              sortedResults,
              index
            );

          const holeWinner =
            item.result === "A"
              ? matchSideNames(
                  match.id,
                  "A"
                )
              : item.result === "B"
                ? matchSideNames(
                    match.id,
                    "B"
                  )
                : "Halved";

          const leaderName =
            cumulative.leader === "A"
              ? matchSideNames(
                  match.id,
                  "A"
                )
              : cumulative.leader === "B"
                ? matchSideNames(
                    match.id,
                    "B"
                  )
                : "";

          return (
  <div
    key={`${item.match_id}-${item.hole_number}`}
    style={{
      width: "100px",
      minHeight: "78px",
      padding: "8px",
      textAlign: "center",
      border:
        "1px solid #edf0ec",
      borderRadius: "6px",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        fontSize: "10px",
        color: "#879087",
      }}
    >
      Hole {item.hole_number}
    </div>

    <div
      style={{
        fontSize: "16px",
        fontWeight: 700,
        marginTop: "4px",
      }}
    >
      {cumulative.status}
    </div>

    <div
      style={{
        fontSize: "10px",
        color: "#879087",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        marginTop: "2px",
      }}
      title={leaderName}
    >
      {leaderName || "All Square"}
    </div>

    <div
      style={{
        fontSize: "9px",
        marginTop: "5px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={holeWinner}
    >
      {item.result === "AS"
        ? "Halved"
        : `${holeWinner} wins`}
    </div>
  </div>
);
        })}
    </div>
  </div>
)}
    </div>
  </div>
)}
    {isMatchComplete(
  match.status,
  holesPlayed,
  totalHoles
) && (
  <div
    className="attention"
    style={{
      marginTop: "12px",
    }}
  >
    <p>
      Match complete — scoring is locked.
    </p>
  </div>
)}

    {match.match_type === "Singles" ? (
  <div
    style={{
      display: "grid",
      gap: "10px",
      marginTop: "15px",
    }}
  >
    <div
      style={{
        padding: "12px",
        borderRadius: "10px",
        background: "#f7f7f7",
        border: "1px solid #e5e5e5",
      }}
    >
      <strong>Singles — Scorecard Results</strong>

      <div
        style={{
          marginTop: "5px",
          fontSize: "13px",
          color: "#666",
        }}
      >
        Scores are entered on the round Scorecards and displayed here automatically.
      </div>
    </div>

    {Array.from(
      {
        length: getCourseHoleCount(
          round?.course_id
        ),
      },
      (_, i) => i + 1
    ).map((holeNumber) => {
      const existing =
        matchHoleResults.find(
          (item) =>
            item.match_id === match.id &&
            item.hole_number ===
              holeNumber
        );

      const sideAPlayer =
        matchPlayersMap[match.id]?.find(
          (item) => item.side === "A"
        );

      const sideBPlayer =
        matchPlayersMap[match.id]?.find(
          (item) => item.side === "B"
        );

      const sideAPlayerId =
        sideAPlayer?.player_id;

      const sideBPlayerId =
        sideBPlayer?.player_id;

      const sideAScore =
        existing?.side_a_score;

      const sideBScore =
        existing?.side_b_score;

      const status =
        existing?.result === "A"
          ? "A wins"
          : existing?.result === "B"
          ? "B wins"
          : existing?.result === "AS"
          ? "Halved"
          : "—";

      return (
        <div
          key={holeNumber}
          style={{
            display: "grid",
            gridTemplateColumns:
              "55px 1fr 1fr 80px",
            gap: "8px",
            alignItems: "center",
            padding:
              "8px 0",
            borderBottom:
              "1px solid #eee",
          }}
        >
          <b>
            {holeNumber}
          </b>

          <div>
            <div
              style={{
                fontSize:
                  "12px",
                color:
                  "#666",
                marginBottom:
                  "3px",
              }}
            >
              {playerName(
                sideAPlayerId
              )}
            </div>

            <strong>
              {sideAScore ??
                "—"}
            </strong>
          </div>

          <div>
            <div
              style={{
                fontSize:
                  "12px",
                color:
                  "#666",
                marginBottom:
                  "3px",
              }}
            >
              {playerName(
                sideBPlayerId
              )}
            </div>

            <strong>
              {sideBScore ??
                "—"}
            </strong>
          </div>

          <strong
            style={{
              textAlign:
                "right",
            }}
          >
            {status}
          </strong>
        </div>
      );
    })}
  </div>

) : match.match_type === "Best Ball" ? (
  <div
    style={{
      display: "grid",
      gap: "14px",
      marginTop: "15px",
    }}
  >
    {Array.from(
      { length: getCourseHoleCount(round?.course_id) },
      (_, i) => i + 1
    ).map((holeNumber) => {
      const existing =
        matchHoleResults.find(
          (item) =>
            item.match_id === match.id &&
            item.hole_number === holeNumber
        );
        const bestBallPlayers =
  matchPlayersMap[match.id] || [];

        const sideAPlayers =
  bestBallPlayers
    .filter(
      (player: any) =>
        player.side === "A"
    )
    .sort(
      (a: any, b: any) =>
        a.position - b.position
    );

        const sideBPlayers =
  bestBallPlayers
    .filter(
      (player: any) =>
        player.side === "B"
    )
    .sort(
      (a: any, b: any) =>
        a.position - b.position
    );

        const sideAPlayer1 =
  sideAPlayers[0];

        const sideAPlayer2 =
  sideAPlayers[1];

        const sideBPlayer1 =
  sideBPlayers[0];

        const sideBPlayer2 =
  sideBPlayers[1];
  

      return (
        <div
          key={holeNumber}
          style={{
            paddingBottom: "14px",
            borderBottom:
              "1px solid #edf0ec",
          }}
        >
          <b>Hole {holeNumber}</b>

          <div
            style={{
              display: "grid",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            
            <div
  style={{
    fontSize: "11px",
    color: "#879087",
    marginBottom: "4px",
  }}
>
  {matchSideNames(match.id, "A")}
</div>

<div
  style={{
    display: "grid",
    gap: "6px",
  }}
>
  <label>
    {sideAPlayer1
      ? playerName(sideAPlayer1.player_id)
      : "Player 1"}

    <input
      id={`bb-a1-${match.id}-${holeNumber}`}
      type="number"
      min="1"
      max="20"
      value={getBestBallInputValue(
  sideAPlayer1?.player_id,
  holeNumber
)}
onChange={(e) => {
  if (!sideAPlayer1) return;

  setBestBallInputs((current) => ({
    ...current,
    [`${sideAPlayer1.player_id}-${holeNumber}`]:
      e.target.value,
  }));
}}
    />
  </label>

  <label>
    {sideAPlayer2
      ? playerName(sideAPlayer2.player_id)
      : "Player 2"}

    <input
      id={`bb-a2-${match.id}-${holeNumber}`}
      type="number"
      min="1"
      max="20"
      value={getBestBallInputValue(
  sideAPlayer2?.player_id,
  holeNumber
)}
onChange={(e) => {
  if (!sideAPlayer2) return;

  setBestBallInputs((current) => ({
    ...current,
    [`${sideAPlayer2.player_id}-${holeNumber}`]:
      e.target.value,
  }));
}}
    />
  </label>
</div>

<div
  style={{
    fontSize: "11px",
    color: "#879087",
    marginTop: "10px",
    marginBottom: "4px",
  }}
>
  {matchSideNames(match.id, "B")}
</div>

<div
  style={{
    display: "grid",
    gap: "6px",
  }}
>
  <label>
    {sideBPlayer1
      ? playerName(sideBPlayer1.player_id)
      : "Player 1"}

    <input
      id={`bb-b1-${match.id}-${holeNumber}`}
      type="number"
      min="1"
      max="20"
      value={getBestBallInputValue(
  sideBPlayer1?.player_id,
  holeNumber
)}
onChange={(e) => {
  if (!sideBPlayer1) return;

  setBestBallInputs((current) => ({
    ...current,
    [`${sideBPlayer1.player_id}-${holeNumber}`]:
      e.target.value,
  }));
}}
    />
  </label>

  <label>
    {sideBPlayer2
      ? playerName(sideBPlayer2.player_id)
      : "Player 2"}

    <input
      id={`bb-b2-${match.id}-${holeNumber}`}
      type="number"
      min="1"
      max="20"
      value={getBestBallInputValue(
  sideBPlayer2?.player_id,
  holeNumber
)}
onChange={(e) => {
  if (!sideBPlayer2) return;

  setBestBallInputs((current) => ({
    ...current,
    [`${sideBPlayer2.player_id}-${holeNumber}`]:
      e.target.value,
  }));
}}
    />
  </label>
</div>

<button
  className="primary"
  disabled={isMatchComplete(
  match.status,
  holesPlayed,
  totalHoles
)}
  style={{
    opacity: isMatchComplete(
  match.status,
  holesPlayed,
  totalHoles
) ? 0.5 : 1,
    cursor: isMatchComplete(
  match.status,
  holesPlayed,
  totalHoles
)
      ? "not-allowed"
      : "pointer",
  }}
  onClick={() => {
                const a1 =
                  Number(
                    (
                      document.getElementById(
                        `bb-a1-${match.id}-${holeNumber}`
                      ) as HTMLInputElement | null
                    )?.value
                  );

                const a2 =
                  Number(
                    (
                      document.getElementById(
                        `bb-a2-${match.id}-${holeNumber}`
                      ) as HTMLInputElement | null
                    )?.value
                  );

                const b1 =
                  Number(
                    (
                      document.getElementById(
                        `bb-b1-${match.id}-${holeNumber}`
                      ) as HTMLInputElement | null
                    )?.value
                  );

                const b2 =
                  Number(
                    (
                      document.getElementById(
                        `bb-b2-${match.id}-${holeNumber}`
                      ) as HTMLInputElement | null
                    )?.value
                  );

                if (
                  !Number.isInteger(a1) ||
                  !Number.isInteger(a2) ||
                  !Number.isInteger(b1) ||
                  !Number.isInteger(b2) ||
                  a1 < 1 ||
                  a2 < 1 ||
                  b1 < 1 ||
                  b2 < 1 ||
                  a1 > 20 ||
                  a2 > 20 ||
                  b1 > 20 ||
                  b2 > 20
                ) {
                  setErrorMessage(
                    "Enter valid scores for all four players."
                  );
                  return;
                }

                saveBestBallHole(
                  match.id,
                  holeNumber,
                  a1,
                  a2,
                  b1,
                  b2
                );
              }}
            >
              Save Hole
            </button>

            {existing && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#879087",
                }}
              >
                {existing && (
  <div
    style={{
      marginTop: "8px",
      fontSize: "11px",
      color: "#879087",
      lineHeight: 1.6,
    }}
  >
    <div>
      Side A best:{" "}
      <b>
        {existing.side_a_net_score}
      </b>
      {" · "}
      {existing.side_a_counting_player_id
        ? playerName(
            existing.side_a_counting_player_id
          )
        : "—"}
    </div>

    <div>
      Side B best:{" "}
      <b>
        {existing.side_b_net_score}
      </b>
      {" · "}
      {existing.side_b_counting_player_id
        ? playerName(
            existing.side_b_counting_player_id
          )
        : "—"}
    </div>

    <div
      style={{
        marginTop: "4px",
        fontWeight: 600,
      }}
    >
      {existing.result === "A"
        ? "Side A wins hole"
        : existing.result === "B"
          ? "Side B wins hole"
          : "Hole halved"}
    </div>
  </div>
)}
              </span>
            )}
          </div>
        </div>
      );
    })}
  </div>
) : (
  <div
    style={{
      display: "grid",
      gap: "14px",
      marginTop: "15px",
    }}
  >
    {Array.from(
      { length: getCourseHoleCount(round?.course_id) },
      (_, i) => i + 1
    ).map((holeNumber) => {
      const existing =
        matchHoleResults.find(
          (item) =>
            item.match_id === match.id &&
            item.hole_number === holeNumber
        );

      const sideAStarter =
        altShotTeeOffName(
          match,
          holeNumber,
          "A"
        );

      const sideBStarter =
        altShotTeeOffName(
          match,
          holeNumber,
          "B"
        );

      return (
        <div
          key={holeNumber}
          style={{
            paddingBottom: "14px",
            borderBottom:
              "1px solid #edf0ec",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <b>
              Hole {holeNumber}
            </b>

            <span
              style={{
                color: "#879087",
                fontSize: "11px",
              }}
            >
              {matchSideNames(match.id, "A")}:{" "}
{sideAStarter}
{" · "}
{matchSideNames(match.id, "B")}:{" "}
{sideBStarter}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr 90px",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <input
              id={`alt-a-${match.id}-${holeNumber}`}
              type="number"
              min="1"
              max="20"
              placeholder={`Side A — ${sideAStarter}`}
              defaultValue={getAltShotScore(
  match.id,
  holeNumber,
  "A"
)}
            />

            <input
              id={`alt-b-${match.id}-${holeNumber}`}
              type="number"
              min="1"
              max="20"
              placeholder={`Side B — ${sideBStarter}`}
              defaultValue={getAltShotScore(
  match.id,
  holeNumber,
  "B"
)}
            />

            <button
  className="primary"
  disabled={isMatchComplete(
  match.status,
  holesPlayed,
  totalHoles
)}
  style={{
    opacity: isMatchComplete(
  match.status,
  holesPlayed,
  totalHoles
) ? 0.5 : 1,
    cursor: isMatchComplete(
  match.status,
  holesPlayed,
  totalHoles
)
      ? "not-allowed"
      : "pointer",
  }}
  onClick={() => {
                const sideA =
                  Number(
                    (
                      document.getElementById(
                        `alt-a-${match.id}-${holeNumber}`
                      ) as HTMLInputElement | null
                    )?.value
                  );

                const sideB =
                  Number(
                    (
                      document.getElementById(
                        `alt-b-${match.id}-${holeNumber}`
                      ) as HTMLInputElement | null
                    )?.value
                  );

                if (
                  !Number.isInteger(sideA) ||
                  !Number.isInteger(sideB) ||
                  sideA < 1 ||
                  sideB < 1 ||
                  sideA > 20 ||
                  sideB > 20
                ) {
                  setErrorMessage(
                    "Enter valid scores for both sides."
                  );
                  return;
                }

                saveAltShotHole(
                  match.id,
                  holeNumber,
                  sideA,
                  sideB
                );
              }}
            >
              Save Hole
            </button>
          </div>

          {existing && (
  <div
    style={{
      marginTop: "8px",
      fontSize: "11px",
      color: "#879087",
      lineHeight: 1.6,
    }}
  >
    <div>
      Gross:{" "}
      <b>{existing.side_a_score}</b>
      {" - "}
      <b>{existing.side_b_score}</b>
    </div>

    <div>
      Net:{" "}
      <b>{existing.side_a_net_score}</b>
      {" - "}
      <b>{existing.side_b_net_score}</b>
    </div>

    <div
      style={{
        marginTop: "4px",
        fontWeight: 600,
      }}
    >
      {existing.result === "A"
        ? "Side A wins hole"
        : existing.result === "B"
          ? "Side B wins hole"
          : "Hole halved"}
    </div>
  </div>
)}
        </div>
      );
    })}
  </div>
)}

    <div
      style={{
        marginTop: "20px",
        paddingTop: "15px",
        borderTop:
          "1px solid #edf0ec",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>Match status</span>

      <b>
        {match.points_a || 0} -{" "}
        {match.points_b || 0}
      </b>
    </div>
  </div>
)}
{useHandicaps &&
  match.match_type !== "Alt Shot" &&
  matchHandicaps.filter(
    (item) => item.match_id === match.id
  ).length > 0 && (
    <div
      className="card"
      style={{ marginTop: "15px" }}
    >
      <h3>Match Handicaps</h3>

      {matchHandicaps
        .filter(
          (item) =>
            item.match_id === match.id
        )
        .map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              padding: "8px 0",
              borderBottom:
                "1px solid #edf0ec",
            }}
          >
            <span>
              {playerName(item.player_id)}
            </span>

            <b>
              {item.playing_handicap}
            </b>
          </div>
        ))}
    </div>
  )}

{useHandicaps &&
  match.match_type === "Alt Shot" &&
  matchHandicaps.filter(
    (item) =>
      item.match_id === match.id &&
      item.side
  ).length > 0 && (
    <div
      className="card"
      style={{ marginTop: "15px" }}
    >
      <h3>Match Handicaps</h3>

      {["A", "B"].map((side) => {
        const sideHandicap =
          matchHandicaps.find(
            (item) =>
              item.match_id === match.id &&
              item.side === side
          );

        const sidePlayers =
  (matchPlayersMap[match.id] || []).filter(
    (player: any) =>
      player.side === side
  );

        return (
          <div
            key={side}
            style={{
              padding: "10px 0",
              borderBottom:
                "1px solid #edf0ec",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "5px",
              }}
            >
              <b>
                Side {side}
              </b>

              <b>
                Playing Handicap:{" "}
                {sideHandicap?.playing_handicap ??
                  "—"}
              </b>
            </div>

            <div
              style={{
                color: "#879087",
                fontSize: "11px",
              }}
            >
              {sidePlayers.length > 0
                ? sidePlayers
                    .sort(
                      (a: any, b: any) =>
                        a.position -
                        b.position
                    )
                    .map(
                      (player: any) =>
                        playerName(
                          player.player_id
                        )
                    )
                    .join(" / ")
                : "Players not loaded"}
            </div>
          </div>
        );
      })}
    </div>
  )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
function Schedule({
  rounds,
  courses,
  selectedTripId,
}: {
  rounds: any[];
  courses: any[];
  selectedTripId: string | null;
}) {
  const tripRounds = rounds.filter(
    (round) =>
      !selectedTripId ||
      round.trip_id === selectedTripId
  );

  const sortedRounds = [...tripRounds].sort(
    (a, b) =>
      Number(a.round_number) -
      Number(b.round_number)
  );

  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Schedule</h2>
          <p>
            Round times, courses and competition
            schedule.
          </p>
        </div>
      </div>

      {sortedRounds.length === 0 ? (
        <div className="card">
          <p
            style={{
              color: "#879087",
              fontSize: "12px",
            }}
          >
            No rounds have been scheduled for this
            trip yet.
          </p>
        </div>
      ) : (
        <div className="cards">
          {sortedRounds.map((round) => {
            const course = courses.find(
              (item) =>
                item.id === round.course_id
            );

            const status =
              round.status || "Scheduled";

            return (
              <div
                className="card"
                key={round.id}
              >
                <div className="cardHead">
                  <div>
                    <h3>
                      Round {round.round_number}
                    </h3>

                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#879087",
                        fontSize: "11px",
                      }}
                    >
                      {round.format ||
                        "Format not set"}
                    </p>
                  </div>

                  <span className="pill">
                    {status}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    marginTop: "14px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#879087",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "3px",
                      }}
                    >
                      Course
                    </div>

                    <b>
                      {course?.name ||
                        "Course not assigned"}
                    </b>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#879087",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "3px",
                      }}
                    >
                      Location
                    </div>

                    <div
                      style={{
                        color: "#879087",
                        fontSize: "11px",
                      }}
                    >
                      {course?.location ||
                        "Location not entered"}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#879087",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "3px",
                      }}
                    >
                      Tee Time
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      {round.tee_time
                        ? new Date(
                            round.tee_time
                          ).toLocaleString()
                        : "Time not set"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
function Settlements({
  players,
  selectedTripId,
  tripDataVersion,
  userRole,
}: {
  players: Player[];
  selectedTripId: string | null;
  tripDataVersion: number;
  userRole: "player" | "admin" | null;
}) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [tripPlayerIds, setTripPlayerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [showExpenseForm, setShowExpenseForm] =
  useState(false);

const [expenseDescription, setExpenseDescription] =
  useState("");

const [expenseCategory, setExpenseCategory] =
  useState("Other");

const [expenseAmount, setExpenseAmount] =
  useState("");

const [expensePayerId, setExpensePayerId] =
  useState("");

const [expenseSaving, setExpenseSaving] =
  useState(false);

const [expenseError, setExpenseError] =
  useState("");

  const [expenseSettlements, setExpenseSettlements] =
  useState<any[]>([]);

  useEffect(() => {
    async function loadSettlementData() {
      if (!selectedTripId) {
        setExpenses([]);
        setTripPlayerIds([]);
        return;
      }

      setLoading(true);

      const { data: playerRows, error: playerError } =
        await supabase
          .from("trip_players")
          .select("player_id")
          .eq("trip_id", selectedTripId);

      if (playerError) {
        console.error(
          "Error loading trip players:",
          playerError
        );
        setTripPlayerIds([]);
        setLoading(false);
        return;
      }

      const playerIds =
        (playerRows || []).map(
          (row) => row.player_id
        );

      setTripPlayerIds(playerIds);

      const { data: expenseRows, error: expenseError } =
        await supabase
          .from("trip_expenses")
          .select("*")
          .eq("trip_id", selectedTripId)
          .order("created_at", {
            ascending: true,
          });

      if (expenseError) {
        console.error(
          "Error loading trip expenses:",
          expenseError
        );
        setExpenses([]);
        setLoading(false);
        return;
      }
      if (!expenseRows || expenseRows.length === 0) {
  setExpenseSettlements([]);
} else {
  const { data: settlementRows, error: settlementError } =
    await supabase
      .from("expense_settlements")
      .select("*")
      .in(
        "expense_id",
        expenseRows.map(
          (expense) => expense.id
        )
      );

  if (settlementError) {
    console.error(
      "Error loading expense settlements:",
      settlementError
    );
    setExpenseSettlements([]);
  } else {
    setExpenseSettlements(
      settlementRows || []
    );
  }
}

      setExpenses(expenseRows || []);
      setLoading(false);
    }
    
  

    loadSettlementData();
  }, [
  selectedTripId,
  tripDataVersion,
]);

  async function addExpense() {
  setExpenseError("");

  if (!selectedTripId) {
    setExpenseError("Select a trip first.");
    return;
  }

  if (!expenseDescription.trim()) {
    setExpenseError("Enter a description.");
    return;
  }

  const amount = Number(expenseAmount);

  if (!Number.isFinite(amount) || amount <= 0) {
    setExpenseError(
      "Enter a valid expense amount."
    );
    return;
  }

  if (!expensePayerId) {
    setExpenseError(
      "Select the player who paid."
    );
    return;
  }

  setExpenseSaving(true);

  const { data, error } = await supabase
    .from("trip_expenses")
    .insert({
  trip_id: selectedTripId,
  paid_by_player_id: expensePayerId,
  category: expenseCategory,
  description: expenseDescription.trim(),
  amount: amount,
})
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error adding expense:",
      error
    );

    setExpenseError(error.message);
    setExpenseSaving(false);
    return;
  }

  setExpenses((current) => [
    ...current,
    data,
  ]);
  setExpenseCategory("Other");
  setExpenseDescription("");
  setExpenseAmount("");
  setExpensePayerId("");
  setExpenseError("");
  setExpenseSaving(false);
  setShowExpenseForm(false);
}

async function toggleExpenseSettlement(
  expenseId: string,
  playerId: string
) {
  setExpenseError("");

  const existing = expenseSettlements.find(
    (item) =>
      item.expense_id === expenseId &&
      item.player_id === playerId
  );

  if (existing) {
    const { error } = await supabase
      .from("expense_settlements")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error(
        "Error removing settlement:",
        error
      );
      setExpenseError(error.message);
      return;
    }

    setExpenseSettlements((current) =>
      current.filter(
        (item) => item.id !== existing.id
      )
    );

    return;
  }

  const expense = expenses.find(
    (item) => item.id === expenseId
  );

  if (!expense || tripPlayers.length === 0) {
    return;
  }

  const share =
    Number(expense.amount) /
    tripPlayers.length;

  const { data, error } = await supabase
    .from("expense_settlements")
    .insert({
      expense_id: expenseId,
      player_id: playerId,
      amount: Number(share.toFixed(2)),
    })
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error recording settlement:",
      error
    );
    setExpenseError(error.message);
    return;
  }

  setExpenseSettlements((current) => [
    ...current,
    data,
  ]);
}

  const tripPlayers = players.filter((player) =>
    tripPlayerIds.includes(player.id)
  );

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const equalShare =
    tripPlayers.length > 0
      ? totalExpenses / tripPlayers.length
      : 0;

  const rows = tripPlayers.map((player) => {
  let stillOwes = 0;
  let stillReceives = 0;

  for (const expense of expenses) {
    const share =
      tripPlayers.length > 0
        ? Number(expense.amount) /
          tripPlayers.length
        : 0;

    const isPayer =
      expense.paid_by_player_id === player.id;

    if (isPayer) {
      // The payer should receive a share
      // from every other player who has not
      // yet settled this expense.
      const otherPlayers = tripPlayers.filter(
        (otherPlayer) =>
          otherPlayer.id !== player.id
      );

      for (const otherPlayer of otherPlayers) {
        const settled =
          expenseSettlements.some(
            (settlement) =>
              settlement.expense_id ===
                expense.id &&
              settlement.player_id ===
                otherPlayer.id
          );

        if (!settled) {
          stillReceives += share;
        }
      }
    } else {
      // This player owes their share unless
      // they have already settled this expense.
      const settled =
        expenseSettlements.some(
          (settlement) =>
            settlement.expense_id ===
              expense.id &&
            settlement.player_id ===
              player.id
        );

      if (!settled) {
        stillOwes += share;
      }
    }
  }

  const net =
    stillReceives - stillOwes;

  return {
    player,
    paid: expenses
      .filter(
        (expense) =>
          expense.paid_by_player_id ===
          player.id
      )
      .reduce(
        (total, expense) =>
          total +
          Number(expense.amount || 0),
        0
      ),
    share: equalShare,
    stillOwes,
    stillReceives,
    net,
  };
});

  async function deleteExpense(expenseId: string) {
  const expense = expenses.find(
    (item) => item.id === expenseId
  );

  if (!expense) {
    return;
  }

  const confirmed = window.confirm(
    `Delete "${expense.description}" for ${formatMoney(
      Number(expense.amount)
    )}?`
  );

  if (!confirmed) {
    return;
  }

  setExpenseError("");

  const { error } = await supabase
    .from("trip_expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    console.error(
      "Error deleting trip cost:",
      error
    );

    setExpenseError(error.message);
    return;
  }

  setExpenses((current) =>
    current.filter(
      (item) => item.id !== expenseId
    )
  );
}
  function formatMoney(value: number) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Settlement overview</h2>
          <p>
            General balance by player.
          </p>
        </div>

        {userRole === "admin" && (
  <button
    className="primary"
    disabled={!selectedTripId}
    onClick={() => {
      setExpenseError("");
      setShowExpenseForm(true);
    }}
  >
    <Plus size={17} />
    Add trip cost
  </button>
)}
      </div>
      {userRole === "admin" &&
  showExpenseForm &&
  selectedTripId && (
  <div className="card compose">
    <div className="cardHead">
      <div>
        <h3>Add Trip Cost</h3>
<p>
  Enter the total cost. It will be split evenly among all trip players.
</p>
      </div>

      <button
        className="icon"
        onClick={() => {
          setShowExpenseForm(false);
          setExpenseError("");
        }}
      >
        <X size={18} />
      </button>
    </div>

    <label>
  Category
  <select
    value={expenseCategory}
    onChange={(e) =>
      setExpenseCategory(e.target.value)
    }
  >
    <option value="Lodging">Lodging</option>
    <option value="Food">Food</option>
    <option value="Transportation">
      Transportation
    </option>
    <option value="Golf">Golf</option>
    <option value="Entertainment">
      Entertainment
    </option>
    <option value="Other">Other</option>
  </select>
</label>

    <label>
      Description
      <input
        value={expenseDescription}
        onChange={(e) =>
          setExpenseDescription(e.target.value)
        }
        placeholder="Dinner"
      />
    </label>

    <label>
      Amount
      <input
        type="number"
        min="0.01"
        step="0.01"
        value={expenseAmount}
        onChange={(e) =>
          setExpenseAmount(e.target.value)
        }
        placeholder="125.00"
      />
    </label>

    <label>
      Paid By
      <select
        value={expensePayerId}
        onChange={(e) =>
          setExpensePayerId(e.target.value)
        }
      >
        <option value="">
          Select player...
        </option>

        {tripPlayers.map((player) => (
          <option
            key={player.id}
            value={player.id}
          >
            {player.first_name}{" "}
            {player.last_name}
          </option>
        ))}
      </select>
    </label>

    {expenseError && (
      <div className="attention">
        <p>⚠ {expenseError}</p>
      </div>
    )}

    <button
      className="primary"
      onClick={addExpense}
      disabled={expenseSaving}
    >
      {expenseSaving
        ? "Saving..."
        : "Save Trip Cost"}
    </button>
  </div>
)}

      {!selectedTripId ? (
        <div className="card">
          <p>
            Select a trip to view settlements.
          </p>
        </div>
      ) : loading ? (
        <div className="card">
          <p>Loading settlements...</p>
        </div>
      ) : tripPlayers.length === 0 ? (
        <div className="card">
          <p>
            No players have been added to this trip yet.
          </p>
        </div>
      ) : (
        <>
          <div
            className="grid4"
            style={{
              marginBottom: "16px",
            }}
          >
            <div className="stat">
              <b>{formatMoney(totalExpenses)}</b>
              <span>Total Expenses</span>
            </div>

            <div className="stat">
              <b>{tripPlayers.length}</b>
              <span>Players</span>
            </div>

            <div className="stat">
              <b>{formatMoney(equalShare)}</b>
              <span>Per Player</span>
            </div>
          </div>

          <div className="card tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
<th>Paid</th>
<th>Share</th>
<th>Owed</th>
<th>Receives</th>
<th>Net</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr key={row.player.id}>
                    <td>
                      <b>
                        {row.player.first_name}{" "}
                        {row.player.last_name}
                      </b>
                    </td>

                    <td>
  {formatMoney(row.paid)}
</td>

<td>
  {formatMoney(row.share)}
</td>

<td>
  {formatMoney(row.stillOwes)}
</td>

<td>
  {formatMoney(row.stillReceives)}
</td>

<td
  className={
    row.net > 0
      ? "positive"
      : row.net < 0
        ? "negative"
        : ""
  }
>
  {row.net > 0
    ? `+${formatMoney(row.net)}`
    : row.net < 0
      ? `-${formatMoney(
          Math.abs(row.net)
        )}`
      : "$0.00"}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
  <div className="cardHead">
    <div>
      <h3>Trip Expenses</h3>
      <p>
        Expenses recorded for this trip.
      </p>
    </div>
  </div>

  {expenses.length === 0 ? (
  <p>No expenses recorded yet.</p>
) : (
  <div>
    {expenses.map((expense) => {
      const payer = players.find(
        (player) =>
          player.id === expense.paid_by_player_id
      );

      const expenseShare =
        tripPlayers.length > 0
          ? Number(expense.amount) /
            tripPlayers.length
          : 0;

      const playersOwing = tripPlayers.filter(
        (player) =>
          player.id !== expense.paid_by_player_id
      );

      const settledPlayers =
        playersOwing.filter((player) =>
          expenseSettlements.some(
            (settlement) =>
              settlement.expense_id === expense.id &&
              settlement.player_id === player.id
          )
        );

      return (
        <div
          key={expense.id}
          style={{
            padding: "14px 0",
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div>
              <b>{expense.description}</b>

              <span
                style={{
                  display: "block",
                  color: "#879087",
                  fontSize: "11px",
                  marginTop: "3px",
                }}
              >
                {expense.category || "Other"}
                {" • "}
                Paid by{" "}
                {payer
                  ? `${payer.first_name} ${payer.last_name}`
                  : "Unknown player"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <strong>
                {formatMoney(
                  Number(expense.amount)
                )}
              </strong>

              {userRole === "admin" && (
  <button
    className="link"
    onClick={() =>
      deleteExpense(expense.id)
    }
  >
    Delete
  </button>
)}
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              paddingTop: "10px",
              borderTop:
                "1px solid rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <strong
                style={{
                  fontSize: "12px",
                }}
              >
                Settlements
              </strong>

              <span
                style={{
                  color: "#879087",
                  fontSize: "11px",
                }}
              >
                {settledPlayers.length} of{" "}
                {playersOwing.length} settled
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gap: "6px",
              }}
            >
              {playersOwing.length === 0 ? (
                <span
                  style={{
                    color: "#879087",
                    fontSize: "11px",
                  }}
                >
                  No other players owe a share.
                </span>
              ) : (
                playersOwing.map((player) => {
                  const settled =
                    expenseSettlements.some(
                      (settlement) =>
                        settlement.expense_id ===
                          expense.id &&
                        settlement.player_id ===
                          player.id
                    );

                  return (
                    <div
                      key={player.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <span>
                          {player.first_name}{" "}
                          {player.last_name}
                        </span>

                        <span
                          style={{
                            display: "block",
                            color: "#879087",
                            fontSize: "10px",
                          }}
                        >
                          Share{" "}
                          {formatMoney(
                            expenseShare
                          )}
                        </span>
                      </div>

                      {userRole === "admin" ? (
  <button
    className={
      settled
        ? "link"
        : "primary"
    }
    onClick={() =>
      toggleExpenseSettlement(
        expense.id,
        player.id
      )
    }
  >
    {settled
      ? "✓ Settled"
      : "Mark Settled"}
  </button>
) : (
  <span>
    {settled
      ? "✓ Settled"
      : "Not Settled"}
  </span>
)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}
</div>
        </>
      )}
    </section>
  );
}
function Notifications({
  selectedTripId,
  userRole,
}: {
  selectedTripId: string | null;
  userRole: "player" | "admin" | null;
}) {
  const [audience, setAudience] = useState("Everyone");
  const [title, setTitle] = useState("Round 2 Pairings Posted");
  const [message, setMessage] = useState(
    "Your Round 2 pairings are now available. Please arrive 20 minutes early."
  );
  const [notifications, setNotifications] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadNotifications() {
      if (!selectedTripId) {
        setNotifications([]);
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("trip_id", selectedTripId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error loading notifications:",
          error
        );
        return;
      }

      setNotifications(data || []);
    }

    loadNotifications();
  }, [selectedTripId]);

  async function sendNotification() {
    setErrorMessage("");
    setSuccessMessage(null);

    if (!selectedTripId) {
      setErrorMessage("Please select a trip first.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Please enter a notification title.");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("Please enter a notification message.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        trip_id: selectedTripId,
        audience,
        title: title.trim(),
        message: message.trim(),
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
  console.error(
    "Error sending notification:",
    JSON.stringify(error, null, 2)
  );

  setErrorMessage(
    error.message ||
      error.details ||
      error.hint ||
      "Unable to send notification."
  );

  return;
}

    setNotifications((current) => [
      data,
      ...current,
    ]);

    setSuccessMessage("Notification sent.");

    setTitle("");
    setMessage("");
  }

  async function deleteNotification(
    notificationId: string
  ) {
    const confirmed = window.confirm(
      "Delete this notification?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error(
        "Error deleting notification:",
        error
      );
      setErrorMessage(error.message);
      return;
    }

    setNotifications((current) =>
      current.filter(
        (item) => item.id !== notificationId
      )
    );
  }

  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Notifications</h2>
          <p>
            Send targeted or trip-wide announcements.
          </p>
        </div>

        {userRole === "admin" && (
  <button
    className="primary"
    onClick={sendNotification}
    disabled={saving}
  >
    <Bell size={17} />
    {saving
      ? "Sending..."
      : "Send notification"}
  </button>
)}
      </div>

      {!selectedTripId ? (
        <div className="card">
          <p
            style={{
              color: "#879087",
              fontSize: "12px",
            }}
          >
            Select a trip to manage notifications.
          </p>
        </div>
      ) : (
        <>
        
          <div
  className="card compose"
  style={{
    display:
      userRole === "admin"
        ? undefined
        : "none",
  }}
>
            <label>
              Audience
              <select
                value={audience}
                onChange={(e) =>
                  setAudience(e.target.value)
                }
              >
                <option>Everyone</option>
                <option>USA</option>
                <option>Europe</option>
                <option>
                  Round participants
                </option>
                <option>
                  Specific players
                </option>
              </select>
            </label>

            <label>
              Title
              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Notification title"
              />
            </label>

            <label>
              Message
              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Enter your message..."
              />
            </label>

            {errorMessage && (
              <p
                style={{
                  color: "#b94a48",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p
                style={{
                  color: "#4f7d5a",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                {successMessage}
              </p>
            )}

            <button
              className="primary"
              onClick={sendNotification}
              disabled={saving}
            >
              <Bell size={17} />
              {saving
                ? "Sending..."
                : "Send notification"}
            </button>
          </div>

          <div
            style={{
              marginTop: "18px",
            }}
          >
            <div className="sectionTop">
              <div>
                <h3>Sent Notifications</h3>
                <p>
                  Previous announcements for this
                  trip.
                </p>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="card">
                <p
                  style={{
                    color: "#879087",
                    fontSize: "12px",
                  }}
                >
                  No notifications have been sent
                  yet.
                </p>
              </div>
            ) : (
              <div className="cards">
                {notifications.map(
                  (notification) => (
                    <div
                      className="card"
                      key={notification.id}
                    >
                      <div className="cardHead">
                        <div>
                          <h3>
                            {notification.title}
                          </h3>

                          <p
                            style={{
                              margin:
                                "4px 0 0",
                              color:
                                "#879087",
                              fontSize:
                                "11px",
                            }}
                          >
                            {notification.audience}
                            {" • "}
                            {new Date(
                              notification.created_at
                            ).toLocaleString()}
                          </p>
                        </div>

                        {userRole === "admin" && (
  <button
    className="link"
    onClick={() =>
      deleteNotification(
        notification.id
      )
    }
  >
    Delete
  </button>
)}
                      </div>

                      <p
                        style={{
                          margin:
                            "12px 0 0",
                          fontSize: "13px",
                          lineHeight: 1.5,
                        }}
                      >
                        {notification.message}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
function SettingsPage({
  selectedTripId,
  trips,
  setTrips,
  useHandicaps,
  setUseHandicaps,
  pointSystem,
  setPointSystem,
  setPlayers,
  setRounds,
  setMatches,
  onTripDataCleared,
}: {
  selectedTripId: string | null;
  trips: any[];
  setTrips: React.Dispatch<
    React.SetStateAction<any[]>
  >;
  useHandicaps: boolean;
  setUseHandicaps: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  pointSystem: "match" | "three_point";
  setPointSystem: React.Dispatch<
    React.SetStateAction<
      "match" | "three_point"
    >
  >;
  setPlayers: React.Dispatch<
    React.SetStateAction<Player[]>
  >;

  setRounds: React.Dispatch<
    React.SetStateAction<any[]>
  >;

  setMatches: React.Dispatch<
    React.SetStateAction<any[]>
  >;

  onTripDataCleared: () => void;
}) {
  const selectedTrip = trips.find(
    (trip) => trip.id === selectedTripId
  );

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [tripName, setTripName] =
    useState(
      selectedTrip?.name ?? ""
    );

   const [tripStartDate, setTripStartDate] =
  useState(
    selectedTrip?.start_date ?? ""
  );

const [tripEndDate, setTripEndDate] =
  useState(
    selectedTrip?.end_date ?? ""
  ); 

  const [competitionFormat, setCompetitionFormat] =
    useState("Ryder Cup");

  const [winPoints, setWinPoints] =
    useState("1.0");

  const [halvePoints, setHalvePoints] =
    useState("0.5");

  const [handicapAllowance, setHandicapAllowance] =
    useState("90%");

  useEffect(() => {
    if (!selectedTrip) {
      return;
    }

    setTripName(
  selectedTrip.name ?? ""
);

setTripStartDate(
  selectedTrip.start_date ?? ""
);

setTripEndDate(
  selectedTrip.end_date ?? ""
);

    setUseHandicaps(
      selectedTrip.use_handicaps ?? true
    );

    setPointSystem(
  selectedTrip.point_system ===
    "three_point"
    ? "three_point"
    : "match"
);
  }, [
    selectedTripId,
    selectedTrip,
    setUseHandicaps,
    setPointSystem,
  ]);

  async function saveSettings() {
    if (!selectedTripId) {
      setMessage("No trip selected.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("trips")
      .update({
  name: tripName,
  start_date: tripStartDate || null,
  end_date: tripEndDate || null,
  use_handicaps: useHandicaps,
  point_system: pointSystem,
})
      .eq("id", selectedTripId);

    if (error) {
      console.error(error);
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setTrips((current) =>
      current.map((trip) =>
        trip.id === selectedTripId
          ? {
    ...trip,
    name: tripName,
    start_date: tripStartDate || null,
    end_date: tripEndDate || null,
    use_handicaps:
      useHandicaps,
    point_system:
      pointSystem,
  }
          : trip
      )
    );

    setMessage(
      "Settings saved successfully."
    );

    setSaving(false);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  async function toggleHandicaps(
    enabled: boolean
  ) {
    if (!selectedTripId) {
      return;
    }

    const previous =
      useHandicaps;

    setUseHandicaps(enabled);

    const { error } = await supabase
      .from("trips")
      .update({
        use_handicaps: enabled,
      })
      .eq("id", selectedTripId);

    if (error) {
      console.error(error);
      setUseHandicaps(previous);
      setMessage(
        "Unable to save handicap setting."
      );
      return;
    }

    setTrips((current) =>
      current.map((trip) =>
        trip.id === selectedTripId
          ? {
              ...trip,
              use_handicaps: enabled,
            }
          : trip
      )
    );

    setMessage(
      enabled
        ? "Handicaps are ON."
        : "Handicaps are OFF."
    );

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  return (
    <section>
      <div className="sectionTop">
        <div>
          <h2>Trip settings</h2>

          <p>
            Competition rules and event
            configuration.
          </p>
        </div>
      </div>

      <div className="card settings">
        <label>
          Trip name

          <input
            value={tripName}
            onChange={(e) =>
              setTripName(
                e.target.value
              )
            }
          />
        </label>

        <label>
  Start date

  <input
    type="date"
    value={tripStartDate}
    onChange={(e) =>
      setTripStartDate(
        e.target.value
      )
    }
  />
</label>

<label>
  End date

  <input
    type="date"
    value={tripEndDate}
    onChange={(e) =>
      setTripEndDate(
        e.target.value
      )
    }
  />
</label>

        <label>
          Competition format

          <select
            value={competitionFormat}
            onChange={(e) =>
              setCompetitionFormat(
                e.target.value
              )
            }
          >
            <option>
              Ryder Cup
            </option>
            <option>
              Custom
            </option>
          </select>
        </label>

        <label>
          Win points

          <input
            value={winPoints}
            onChange={(e) =>
              setWinPoints(
                e.target.value
              )
            }
          />
        </label>

        <label>
          Halve points

          <input
            value={halvePoints}
            onChange={(e) =>
              setHalvePoints(
                e.target.value
              )
            }
          />
        </label>

        <label>
          Handicap allowance

          <input
            value={handicapAllowance}
            onChange={(e) =>
              setHandicapAllowance(
                e.target.value
              )
            }
            disabled={!useHandicaps}
          />
        </label>
<div
  className="card"
  style={{
    marginTop: "8px",
  }}
>
  <div className="cardHead">
    <div>
      <h3>
        Point System
      </h3>

      <p
        style={{
          margin: "4px 0 0",
          color: "#879087",
          fontSize: "11px",
        }}
      >
        Choose how many competition
        points each match can award.
      </p>
    </div>

    <select
      value={pointSystem}
      onChange={(e) =>
        setPointSystem(
          e.target.value as
            | "match"
            | "three_point"
        )
      }
    >
      <option value="match">
        1 Point Match
      </option>

      <option value="three_point">
        3 Point Match
      </option>
    </select>
  </div>

  <div
    style={{
      marginTop: "10px",
      fontSize: "11px",
      color: "#879087",
    }}
  >
    {pointSystem === "three_point"
      ? "1 point for the front nine, 1 point for the back nine, and 1 point for the overall match."
      : "1 point for the overall match. A halved match awards 0.5 points to each side."}
  </div>
</div>
        <div
          className="card"
          style={{
            marginTop: "8px",
          }}
        >
          <div
            className="cardHead"
          >
            <div>
              <h3>
                Handicap Scoring
              </h3>

              <p
                style={{
                  margin:
                    "4px 0 0",
                  color:
                    "#879087",
                  fontSize:
                    "11px",
                }}
              >
                Turn handicaps on
                or off for the
                entire trip.
              </p>
            </div>

            <select
              value={
                useHandicaps
                  ? "on"
                  : "off"
              }
              onChange={(e) =>
                toggleHandicaps(
                  e.target.value ===
                    "on"
                )
              }
            >
              <option value="on">
                On
              </option>

              <option value="off">
                Off
              </option>
            </select>
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "11px",
              color: "#879087",
            }}
          >
            {useHandicaps
              ? "Playing handicaps will be used for scorecards and matches."
              : "All scoring is gross-only. Handicap strokes and net scores are disabled."}
          </div>
        </div>

        {message && (
          <div
            className="attention"
            style={{
              marginTop: "12px",
            }}
          >
            <p>
              {message}
            </p>
          </div>
        )}

        <button
          className="primary"
          onClick={
            saveSettings
          }
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save settings"}
        </button>

        <div
  className="card"
  style={{
    marginTop: "20px",
    border: "1px solid #e3c5bf",
  }}
>
  <h3>Danger Zone</h3>

  <p
    style={{
      color: "#879087",
      fontSize: "11px",
      lineHeight: 1.5,
    }}
  >
    Clear competition data for the
    selected trip. Courses, tees and
    hole information will remain.
  </p>

  <button
    className="link"
    onClick={clearTripData}
    disabled={saving}
  >
    Clear Trip Data
  </button>
</div>
      </div>
    </section>
  );
  async function clearTripData() {
  if (!selectedTripId) {
    setMessage("No trip selected.");
    return;
  }

  const trip = trips.find(
    (item) => item.id === selectedTripId
  );

  const tripName =
    trip?.name || "this trip";

  const confirmed = window.confirm(
  `Clear all competition data for ${tripName}?\n\n` +
  `This will permanently delete rounds, matches, scores, handicap calculations, expenses, and player assignments for this trip.\n\n` +
  `Global players, courses, tees, and hole information will be preserved.`
);

  if (!confirmed) {
    return;
  }

  setSaving(true);
  setMessage("");

  const { error } = await supabase.rpc(
    "clear_trip_data",
    {
      target_trip_id: selectedTripId,
    }
  );

  if (error) {
    console.error(
      "Error clearing trip data:",
      error
    );

    setMessage(
      error.message ||
        "Unable to clear trip data."
    );

    setSaving(false);
    return;
  }

  
setRounds([]);
setMatches([]);

onTripDataCleared();

  setMessage(
    "✓ Trip data cleared successfully."
  );

  setSaving(false);

  setTimeout(() => {
  window.location.reload();
}, 800);
}
}
