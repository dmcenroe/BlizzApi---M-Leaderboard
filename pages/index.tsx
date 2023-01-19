import type { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import blizzAPI from "../utils/blizzAPI";
import type { blizzApiMythicPlusLeaderBoard } from "../utils/types";
import specMedia from "../utils/specMedia";
import { useEffect, useState, useRef } from "react";
import Filters from "../components/filters";
import { setLeaderBoardData } from "../slices/leaderBoardSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDungeonId,
  selectConnectedRealm,
  selectLeaderBoardData,
} from "../slices/leaderBoardSlice";
import Loading from "../components/loading";
import { msToTime } from "../utils/helperFunctions";
import FadeIn from "../components/fadeIn";
import Pagination from "../components/pagination";

export async function getStaticProps() {
  console.log("static props");
  const dungeonList = await blizzAPI.query(
    "/data/wow/connected-realm/11/mythic-leaderboard/index?namespace=dynamic-us&locale=en_US"
  );
  const realmList = await blizzAPI.query(
    "/data/wow/search/connected-realm?namespace=dynamic-us&orderby=id"
  );
  return {
    props: {
      dungeonList,
      realmList,
    },
  };
}

const Home: NextPage = ({ dungeonList, realmList }) => {
  const dispatch = useDispatch();

  const initialRender = useRef(true);

  const [currentLeaderBoard, setCurrentLeaderBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedDungeonId = useSelector(selectDungeonId);
  const selectedRealmId = useSelector(selectConnectedRealm);
  const storedLeaderBoard = useSelector(selectLeaderBoardData);

  const getLeaderBoard = async () => {
    const response = await fetch(
      `/api/leaderboard/${selectedRealmId}/${selectedDungeonId}`
    );
    const data = await response.json();

    setCurrentLeaderBoard(data);
    dispatch(setLeaderBoardData(data));
    setLoading(false);
  };

  useEffect(() => {
    //not registering initial drop down change when app loads
    //trying to make it bring in stored leaderboard when I hit "back", otherwise, fetch fresh data.
    if (initialRender.current && storedLeaderBoard.name) {
      initialRender.current = false;
      setLoading(false);
      setCurrentLeaderBoard(storedLeaderBoard);
    } else {
      initialRender.current = false;
      setLoading(true);
      getLeaderBoard();
    }
  }, [selectedDungeonId, selectedRealmId]);

  return (
    <>
      <Head>
        <title>Mythic+ Leaderboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-slate-900 w-screen h-full">
        <div className="p-20 text-center">
          <div className="text-6xl font-black tracking-wider text-stone-100">
            M+ Weekly Leaderboard
          </div>
        </div>
        <Filters dungeons={dungeonList} realms={realmList} />
        {loading ? (
          <Loading />
        ) : (
          <Pagination currentLeaderBoard={currentLeaderBoard} />
        )}
      </main>
    </>
  );
};

export default Home;
