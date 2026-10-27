import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { Route, Routes } from "react-router";
import "./App.css";
import ArchdukeVonOrbenScene from "./components/clocks/archduke-von-orben/ArchdukeVonOrben";
import DebugListener from "./components/misc/DebugListener";
import Timekeeper from "./components/misc/Timekeeper";
import FullscreenHandleComponent from "./components/ui/FullscreenHandleComponent";
import InfoAndAckModal from "./components/ui/InfoAndAckModal";
import InteractionListener from "./components/ui/InteractionListener";
import Sidebar from "./components/ui/Sidebar";
import useAppStore from "./stores/useAppStore";

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const debug = useAppStore((state) => state.debug);
  const handle = useFullScreenHandle();
  return (
    <>
      {/* <Leva hidden={!debug} collapsed /> */}
      <div className="h-full w-full overflow-hidden bg-zinc-900 text-sky-50">
        <Timekeeper />
        <FullscreenHandleComponent handle={handle} />
        <FullScreen handle={handle}>
          <InteractionListener />
          <Sidebar />
          <InfoAndAckModal />
          <DebugListener />
          <div className="h-screen w-screen">
            <Routes>
              <Route
                path="/ArchdukeVonOrben"
                element={<ArchdukeVonOrbenScene />}
              />
              <Route path="*" element={<ArchdukeVonOrbenScene />} />
            </Routes>
          </div>
        </FullScreen>
      </div>
      <div className="fixed right-2 bottom-2 text-sm text-sky-50 opacity-25">
        This site is still a work in progress
      </div>
    </>
  );
}

export default App;
