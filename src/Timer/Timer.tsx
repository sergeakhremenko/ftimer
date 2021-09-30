import { JSX } from "preact";
import { useState, useCallback, useEffect } from "preact/hooks";
import NoSleep from "nosleep.js";

import { Process, ProcessStatus } from "./Process";
import { ProcessControl, ProcessControlStatus } from "./ProcessControl";

import { getMillisecondsFromMinutes } from "../utils/common";
import { useAlarm } from "../hooks/useAlarm";

import styles from "./Timer.css";

const noSleep = new NoSleep();

const TIMEOUT_PER_MIN = 1;
const TIMEOUT = getMillisecondsFromMinutes(TIMEOUT_PER_MIN);

const enum Status {
  Start,
  Run,
  Pause,
  Finish,
}

const processControlStatuses = {
  [Status.Start]: ProcessControlStatus.Start,
  [Status.Run]: ProcessControlStatus.Run,
  [Status.Pause]: ProcessControlStatus.Pause,
  [Status.Finish]: ProcessControlStatus.Start,
};

const processStatuses = {
  [Status.Start]: ProcessStatus.Start,
  [Status.Run]: ProcessStatus.Run,
  [Status.Pause]: ProcessStatus.Pause,
  [Status.Finish]: ProcessStatus.Start,
};

type Props = {
  path: string;
};

export const Timer = (props: Props): JSX.Element => {
  const [status, setStatus] = useState<Status>(Status.Start);

  useEffect(() => {
    const enableNoSleep = () => {
      document.removeEventListener("click", enableNoSleep, false);

      if (status === Status.Run && !noSleep.isEnabled) {
        noSleep.enable();
      }
    };

    document.addEventListener("click", enableNoSleep);

    return () => {
      document.removeEventListener("click", enableNoSleep);
    };
  }, [status]);

  const handleAlarmFinish = useCallback(() => {
    setStatus(Status.Start);
  }, []);

  const initAlarm = useAlarm(status === Status.Finish, handleAlarmFinish);

  const handleStart = useCallback(() => {
    noSleep.enable();
    initAlarm();
    setStatus(Status.Run);
  }, []);

  const handlePause = useCallback(() => {
    setStatus(Status.Pause);
  }, []);

  const handleStop = useCallback(() => {
    setStatus(Status.Start);
  }, []);

  const handleProcessFinish = useCallback(() => {
    setStatus(Status.Finish);
  }, []);

  useEffect(() => {
    if (status !== Status.Run) {
      noSleep.disable();
    }
  }, [status]);

  return (
    <div class={styles.timer}>
      <Process
        status={processStatuses[status]}
        timeout={TIMEOUT}
        onFinish={handleProcessFinish}
      />
      <ProcessControl
        status={processControlStatuses[status]}
        onStart={handleStart}
        onPause={handlePause}
        onStop={handleStop}
      />
    </div>
  );
};
