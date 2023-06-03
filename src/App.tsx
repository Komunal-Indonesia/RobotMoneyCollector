import Grid, { type RobotPosition } from "./components/Grid";
import Modal from "./components/Modal";
import TutorialList from "./components/TutorialList";
import Credits from "./components/Credits";
import compass from "./assets/compass.png";
import * as React from "react";
import Input from "./components/Input";
import { COMMANDS, ERRORS, FACING_DIRECTIONS, FACING_FROM_DEGREE, INITIAL_ROTATE_DEG, ORIENTATION } from "./constants";
import { isRobotOnTable, isValidCoordinate } from "./utils";

const facingPosition = { x: 0, y: 0 };
function App() {
  const [textCommand, setTextCommand] = React.useState('');
  const [rows, setRows] = React.useState<number>();
  const [cols, setCols] = React.useState<number>();
  const [errorMessage, setErrorMessage] = React.useState('');
  const [robotPosition, setRobotPosition] = React.useState<RobotPosition>({ x: undefined, y: undefined });
  const [rotateDeg, setRotateDeg] = React.useState(0);
  const [isRobotPlaced, setIsRobotPlaced] = React.useState(false);
  const [totalMove, setTotalMove] = React.useState(15);
  const [isFocusTextCommand, setFocusTextCommand] = React.useState(false);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (isRobotPlaced && !isFocusTextCommand) {
      event.preventDefault();
      if (event.code === "Space") {
        runCommand('MOVE')
      } else if (event.code === "ArrowLeft") {
        runCommand('LEFT')
      } else if (event.code === "ArrowRight") {
        runCommand('RIGHT')
      }
    }
  }

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [
    isRobotPlaced,
    isFocusTextCommand,
    facingPosition?.x,
    facingPosition?.y,
    robotPosition?.x,
    robotPosition?.y
  ])

  const moveLeftRight = (type: 'left' | 'right') => {
    let deg = rotateDeg - 90
    let rotate = deg === -90 ? 270 : deg
    if (type === 'right') {
      deg = rotateDeg + 90
      rotate = deg === 360 ? 0 : deg;
    }
    setTextCommand('');
    setRotateDeg(rotate)
    const direction = FACING_FROM_DEGREE[rotate as keyof typeof FACING_FROM_DEGREE]
    const {x: orX, y: orY} = ORIENTATION[direction as keyof typeof ORIENTATION];
    facingPosition.x = orX;
    facingPosition.y = orY;
  }

  const runCommand = (keyboardCommand?: string) => {
    const commandVal = textCommand.split(/[\s,]+/);
    const command = keyboardCommand || commandVal[0];
    const {x, y} = robotPosition || {};
    if (command) {
      if (!COMMANDS.includes(command)) {
        setErrorMessage(ERRORS.INVALID_COMMAND)
        return;
      } 

      if (!isRobotPlaced && command !== 'PLACE') {
        setErrorMessage(ERRORS.NOT_INITIALIZED);
        return;
      }
      
      switch (command) {
        case 'PLACE': {
          if (commandVal.length < 4) {
            setErrorMessage(ERRORS.INVALID_INITIAL_COMMAND);
          } else {
            const x = Number(commandVal[1]);
            const y = Number(commandVal[2]);
            const f = commandVal[3];
    
            if (!isValidCoordinate(x) || !isValidCoordinate(y)) {
              setErrorMessage(ERRORS.WRONG_COORDINATE);
              return;
            }
    
            if (!FACING_DIRECTIONS.includes(f)) {
              setErrorMessage(ERRORS.WRONG_DIRECTION);
              return;
            }
    
            if (!isRobotOnTable({ rows, cols, x, y })) {
              setErrorMessage(ERRORS.WRONG_PLACE);
              return;
            }
            setRobotPosition({x, y})
            setIsRobotPlaced(true);
            setTextCommand('');
            const {x: facingX, y: facingY} = ORIENTATION[f as keyof typeof ORIENTATION] || {};
            facingPosition.x = facingX;
            facingPosition.y = facingY;
            setRotateDeg(INITIAL_ROTATE_DEG[f as keyof typeof INITIAL_ROTATE_DEG])
          }
          return;
        }
        case 'MOVE': {
          if (totalMove <= 0) {
            setErrorMessage(ERRORS.EMPTY_MOVE);
            return;
          }
          if (x !== undefined && y !== undefined) {
            const nextX = x + facingPosition.x ;
            const nextY = y + facingPosition.y;
    
            if (!isRobotOnTable({ rows, cols, x: nextX, y: nextY })) {
              setErrorMessage(ERRORS.WRONG_MOVING_DIRECTION);
              return;
            }
            setRobotPosition({x: nextX, y: nextY})
            setTotalMove(val => val - 1);
            setTextCommand('');
          }
          return;
        }
        case 'LEFT': {
          moveLeftRight('left')
          return;
        }
        case 'RIGHT': {
          moveLeftRight('right')
          return;
        }
      }

    }
  }

  const reset = () => {
    setRobotPosition({x: undefined, y: undefined})
    setTextCommand('');
    setErrorMessage('');
    setIsRobotPlaced(false);
    setRotateDeg(0);
    setTotalMove(15)
  }

  return (
    <div className='p-20'>
      <h1 className="font-bold text-center text-3xl mb-4">
        Robot Money Collector
      </h1>

      <div className="flex flex-row mb-4 items-center">
        <img src={compass} alt="compass" className="w-20" />
        <div className="flex flex-col flex-1">
          <div className="flex flex-row items-center">
            <Input
              type="text"
              placeholder="Your wish is my command"
              value={textCommand}
              onChange={(val: string) => {setTextCommand(val.toUpperCase())}}
              onFocus={() => {
                setFocusTextCommand(true)
              }}
              onBlur={() => {
                setFocusTextCommand(false)
              }}
            />
            <button
              onClick={() => runCommand()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-2 rounded">
              Run
            </button>
            <button
              onClick={reset}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
              Reset
            </button>
          </div>
          <p id="helper-text-explanation" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Available Commands : PLACE X,Y,F | MOVE | LEFT | RIGHT
          </p>
        </div>
      </div>
      <div className="flex flex-row gap-4 mb-4">
        <Input
          label="Rows"
          type="number"
          placeholder="Input rows number"
          value={rows}
          onChange={(val: string) => {setRows(Number(val))}}
        />
        <Input
          label="Cols"
          type="number"
          placeholder="Input columns number"
          value={cols}
          onChange={(val: string) => {setCols(Number(val))}}
        />
      </div>
      <Grid
        totalMove={totalMove}
        rows={rows}
        cols={cols}
        robotPosition={robotPosition}
        rotateDeg={rotateDeg}
      />
      <Modal
        title="Error Occured"
        isShow={!!errorMessage}
        description={errorMessage}
        onOk={() => {setErrorMessage('')}}
      />
      <TutorialList />
      <Credits />
    </div>
  )
}

export default App;
