import { ParticleField } from "./ParticleField";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Lab() {
  return (
    <Section
      id="lab"
      title="Lab"
      intro="I like interfaces you can touch. Push the particles around, or switch on your camera and do it with your hands, the way Hand Graph and particle-hands work."
    >
      <Reveal>
        <ParticleField />
      </Reveal>
    </Section>
  );
}
