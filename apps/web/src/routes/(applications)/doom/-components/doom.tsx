import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/components/select";
import { useIsMobile } from "@acme/ui/hooks/use-mobile";
import { cn } from "@acme/ui/lib/utils";
import React from "react";

type Game = "doom1" | "freedoom1" | "freedoom2";

export function Doom() {
  const [game, setGame] = React.useState<Game>("doom1");
  const [nonce, setNonce] = React.useState(() => Date.now());
  const [started, setStarted] = React.useState(false);
  const [iframeReady, setIframeReady] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();

  function selectGame(next: Game): void {
    setGame(next);
    if (!started) return;
    // force a clean engine restart
    setNonce(Date.now());
  }

  function startGame(next?: Game): void {
    if (next) setGame(next);
    setNonce(Date.now());
    setStarted(true);
  }

  React.useEffect(() => {
    if (!started || !iframeReady) return;
    const target = iframeRef.current?.contentWindow;
    if (!target) return;
    target.postMessage(
      {
        iwad: game,
        type: "BOOT",
      },
      window.location.origin,
    );
  }, [game, iframeReady, started]);

  return (
    <div className="bg-background/80 text-foreground relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-2 shadow-lg sm:gap-4 sm:p-5">
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        <div
          className={cn(
            "relative w-full",
            started
              ? isMobile
                ? "h-full"
                : "aspect-4/3 max-h-full sm:max-w-[calc(80vh*4/3)]"
              : "h-full w-full p-4",
          )}
        >
          <div className="bg-primary/60 pointer-events-none absolute -inset-2 animate-pulse opacity-70 blur-lg" />
          <div className="border-border/60 bg-card/80 relative h-full w-full border p-1 sm:p-3">
            <div className="bg-background/95 relative h-full w-full overflow-hidden">
              {started ? (
                <div className="h-full w-full">
                  <iframe
                    key={nonce}
                    title="Doom"
                    src="/dwasm/index.html"
                    className="h-full w-full border-0"
                    ref={iframeRef}
                    allowFullScreen
                    allow="gamepad"
                    onLoad={() => setIframeReady(true)}
                  />
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 overflow-y-auto px-3 py-4 text-center sm:gap-4 sm:px-4 sm:py-6">
                  <img
                    src="/dwasm/freedoom.webp"
                    alt="Freedoom"
                    width={1536}
                    height={1024}
                    className="w-auto max-w-90 object-contain drop-shadow-xl sm:max-w-105"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className="text-muted-foreground font-mono text-[11px] tracking-[0.2em] uppercase"
                      id="doom-game-label"
                    >
                      Select Game
                    </span>
                    <Select
                      onValueChange={(value) => selectGame(value as Game)}
                      value={game}
                    >
                      <SelectTrigger
                        aria-label="Select game"
                        aria-labelledby="doom-game-label"
                        className="border-border/60 bg-muted/40 text-foreground hover:bg-muted/60 data-[state=open]:border-primary/60 data-[state=open]:bg-muted/60 w-full max-w-64 font-mono text-[11px] tracking-[0.2em] uppercase shadow-sm"
                        id="doom-game-select"
                      >
                        <SelectValue placeholder="Select a game" />
                      </SelectTrigger>
                      <SelectContent className="border-border/60 bg-card/95 text-foreground font-mono text-[11px] tracking-[0.2em] uppercase">
                        <SelectItem
                          className="focus:bg-primary/10 focus:text-foreground"
                          value="doom1"
                        >
                          Shareware Doom
                        </SelectItem>
                        <SelectItem
                          className="focus:bg-primary/10 focus:text-foreground"
                          value="freedoom1"
                        >
                          Freedoom I
                        </SelectItem>
                        <SelectItem
                          className="focus:bg-primary/10 focus:text-foreground"
                          value="freedoom2"
                        >
                          Freedoom II
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    className="border-primary/70 bg-primary text-primary-foreground hover:bg-primary/90 border px-6 py-2 font-mono text-[12px] font-black tracking-[0.3em] uppercase shadow-sm transition"
                    onClick={() => startGame()}
                    type="button"
                  >
                    Start Game
                  </button>
                  <div className="text-muted-foreground max-w-105 font-mono text-[11px] tracking-[0.14em] text-balance uppercase sm:text-xs">
                    WebAssembly Doom port with Dwasm. Select a game and get in.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {started && <DoomFooter active={started} runKey={`${nonce}-${game}`} />}
    </div>
  );
}

type DoomFooterProps = {
  active: boolean;
  runKey: string | number;
};

function DoomFooter({ active, runKey }: DoomFooterProps) {
  const isMobile = useIsMobile();
  return (
    <div
      className={cn(
        isMobile ? "hidden" : "flex items-center justify-center",
        "text-muted-foreground min-h-12 shrink-0 px-3 pb-1 text-center font-mono text-[10px] tracking-[0.18em] uppercase sm:min-h-14 sm:px-4 sm:text-xs",
        active ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <span className="relative block w-full max-w-full" key={runKey}>
        {/*Invisible instructions to about layout shift.*/}
        <DoomInstructions className="text-foreground/0 text-md lg:text-lg" />
        <DoomInstructions
          className={cn(
            "text-md text-primary pointer-events-none absolute inset-0 lg:text-lg",
            active && "animate-doom-reveal",
          )}
        />
      </span>
    </div>
  );
}

type DoomControlsTextProps = Omit<React.ComponentProps<"span">, "children">;

function DoomInstructions({ className, ...props }: DoomControlsTextProps) {
  return (
    <span
      className={cn("block leading-relaxed whitespace-normal", className)}
      {...props}
    >
      AIM: MOUSE OR O/P · FIRE: LEFT MOUSE OR SPACE · MOVE: WASD · RUN: SHIFT ·
      USE: E · MENU: ESC · TAB: MAP
    </span>
  );
}
