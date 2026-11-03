import { Button } from "@acme/ui/components/button";
import { ClientOnly } from "@tanstack/react-router";
import { Frown } from "lucide-react";
import {
  CRTScreen,
  DotGrid,
  Glitch,
  Shader,
  Shatter,
  SolidColor,
} from "shaders/react";
import { useSystem } from "../system/system-provider";

export function BSODScreen() {
  const { shutdown, viewportAspect } = useSystem();
  const vignetteRadius =
    0.33 * Math.min(1.4, Math.max(1, viewportAspect / (16 / 9)));

  return (
    <div className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden bg-[#0b2ea3] text-[#e6f0ff]">
      <ClientOnly>
        <Shader aria-hidden="true" className="absolute inset-0">
          <CRTScreen
            pixelSize={140}
            colorShift={1.2}
            scanlineIntensity={0.25}
            scanlineFrequency={200}
            brightness={1.11}
            contrast={1.06}
            vignetteIntensity={1.16}
            vignetteRadius={vignetteRadius}
          >
            <Shatter intensity={12} crackWidth={9}>
              <SolidColor color="#0b2ea3" />
              <DotGrid
                color="#d9e9ff"
                density={70}
                dotSize={0.018}
                twinkle={0.04}
              />
              <Glitch intensity={0.28} speed={0.55} />
            </Shatter>
          </CRTScreen>
        </Shader>
      </ClientOnly>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 text-left font-mono">
        <div>
          <Frown className="size-12" />
        </div>
        <div className="space-y-2 leading-relaxed text-[#f1f6ff] [text-shadow:0_1px_0_rgba(0,0,0,0.35)]">
          <p>Your PC ran into a problem and needs to restart.</p>
          <p>If you call a support person, give them this info:</p>
          <code>
            ERROR: <b>YOU_ARE_ABSOLUTELY_RIGHT</b>
          </code>
        </div>
        <Button
          onClick={shutdown}
          variant="ghost"
          className="w-fit border border-[#f1f6ff]! text-lg font-medium text-[#f1f6ff]! underline underline-offset-4 opacity-90 transition hover:bg-[#f1f6ff]! hover:text-[#0b2ea3]!"
        >
          SHUT DOWN
        </Button>
      </div>
    </div>
  );
}
