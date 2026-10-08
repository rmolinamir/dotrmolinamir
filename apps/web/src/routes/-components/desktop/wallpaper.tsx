import { DarkThemeOnly, LightThemeOnly } from "@acme/ui/components/theme";
import { ClientOnly } from "@tanstack/react-router";
import type React from "react";
import {
  CRTScreen,
  FlowField,
  Glitch,
  ImageTexture,
  Liquify,
  Shader,
} from "shaders/react";
import { useSystem } from "../system/system-provider";

const LIGHT_WALLPAPER = "/vibrant-wallpaper-light.webp";
const DARK_WALLPAPER = "/vibrant-wallpaper-dark.webp";

type WallpaperProps = React.ComponentProps<typeof Shader>;

export function Wallpaper(props: WallpaperProps) {
  const { viewportAspect } = useSystem();
  const vignetteRadius =
    0.33 * Math.min(1.4, Math.max(1, viewportAspect / (16 / 9)));

  return (
    <ClientOnly>
      <Shader aria-hidden="true" {...props}>
        <CRTScreen
          pixelSize={140}
          colorShift={1.2}
          scanlineIntensity={0.32}
          scanlineFrequency={220}
          brightness={1.11}
          contrast={1.06}
          vignetteIntensity={1.16}
          vignetteRadius={vignetteRadius}
        >
          <Glitch intensity={0.1} speed={0.5}>
            <Liquify intensity={0.8} radius={1.5} edges="mirror">
              <FlowField strength={0.4} detail={1.2} speed={0.1} edges="mirror">
                <LightThemeOnly>
                  <ImageTexture url={LIGHT_WALLPAPER} />
                </LightThemeOnly>
                <DarkThemeOnly>
                  <ImageTexture url={DARK_WALLPAPER} />
                </DarkThemeOnly>
              </FlowField>
            </Liquify>
          </Glitch>
        </CRTScreen>
      </Shader>
    </ClientOnly>
  );
}
