import base64
import io
import re
from typing import Dict, Any, Optional
import cv2
import numpy as np
from PIL import Image

def detect_people_count(image_data: Optional[str] = None, details: str = "") -> int:
    """
    Extracts the number of people in the image using OpenCV Haar Cascades
    (Face + Body detection), with a contextual natural language fallback.
    """
    detected_count = 0

    # 1. Computer Vision: Detect faces and human silhouettes in uploaded image
    if image_data:
        try:
            raw_base64 = image_data
            if "," in raw_base64:
                raw_base64 = raw_base64.split(",", 1)[1]
            img_bytes = base64.b64decode(raw_base64)
            pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            np_img = np.array(pil_img)
            gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)

            # Frontal face cascade
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(20, 20))

            if len(faces) > 0:
                detected_count = len(faces)
            else:
                # Upper body cascade for figures from behind or distance
                body_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_upperbody.xml')
                bodies = body_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=2, minSize=(30, 30))
                if len(bodies) > 0:
                    detected_count = len(bodies)
        except Exception:
            pass

    # 2. Heuristic text fallback if CV was inconclusive
    if detected_count == 0 and details:
        lower = details.lower()
        if re.search(r'\b(three|3|four|4|five|5|trio|group|crowd|squad|team|crew|soldiers|guards|gathering|family)\b', lower):
            detected_count = 3
        elif re.search(r'\b(two|2|pair|duo|couple|partners|both|rivals|together|companions)\b', lower):
            detected_count = 2
        elif re.search(r'\b(one|1|lone|alone|solitary|single|individual|figure|stranger|man|woman|pilot|wanderer|detective)\b', lower):
            detected_count = 1

    # Default to 1 (Solo)
    if detected_count == 0:
        detected_count = 1

    return min(detected_count, 3)

def generate_genre_narrative(details: str, genre: str, people_count: int = 1) -> Dict[str, Any]:
    """
    Generates tailored, atmospheric, non-generic genre stories dynamically tweaked
    based on the exact number of people detected in the image.
    """
    clean_details = details.strip() or "A mysterious figure observing the horizon."
    first_clause = clean_details.split(".")[0].strip()

    # Dynamic Cast Labels
    cast_meta = {
        1: {"label": "Solo Protagonist", "tag": "1 Person Detected", "icon": "👤"},
        2: {"label": "Duo / Partnership", "tag": "2 People Detected", "icon": "👥"},
        3: {"label": "Group / Squad", "tag": "3+ People Detected", "icon": "👥👥"}
    }
    current_cast = cast_meta.get(people_count, cast_meta[1])

    # Narrative Matrix tailored by Genre and Cast Size
    genre_library = {
        "Sci-Fi": {
            1: {
                "title": f"The Solitary Orbit: {first_clause[:30]}",
                "p1": f"The pressurization seal hissed as the cockpit settled into the eternal quiet of the outer rim. Alone behind the reinforced quartz viewport, the solitary pilot stared down at {clean_details.lower()}. There were no incoming transmissions, no ground control relay—only the steady, hypnotic pulse of the oxygen scrubbers keeping time against the endless dark.",
                "p2": f"One set of gloved hands worked the manual navigation thrusters, carefully stabilizing the descent trajectory. Every telemetry readout flared amber; the gravitational gradient was steepening rapidly. Facing this threshold in total isolation, the pilot realized that whatever lay embedded within {clean_details}, no one else in the quadrant was coming to confirm it.",
                "p3": f"With a quiet intake of recycled air, the main thrusters were engaged into the unknown. A single beacon was dropped into orbit to mark the coordinate, but the lone journey downward had already begun."
            },
            2: {
                "title": f"Tethered at the Edge: {first_clause[:30]}",
                "p1": f"The airlock depressurized with a mechanical shudder, spilling pale starlight across two suited figures. Linked by a reinforced braided tether across the vacuum, the pair anchored their boots onto the maintenance gantry, their optical visors reflecting {clean_details.lower()}.",
                "p2": f"\"Telemetry's fluctuating,\" the first signaled over the private radio band, adjusting the multi-spectrum sensor wand. \"Hold the stabilizer line steady.\" The second nodded, bracing against the cold hull plating as plasma arcs danced along the seam. Between the two of them lay seven years of deep-space missions and an unspoken trust that neither dared question when inches from a void.",
                "p3": f"Working in seamless tandem, the pair locked the containment clamp directly over the anomaly. As the readings stabilized, their eyes met through the polarized glass—two minds bound by a single survival pact on the frontier of human space."
            },
            3: {
                "title": f"The Outpost Contingency: {first_clause[:30]}",
                "p1": f"Alarms echoed in rhythmic syncopation across the flight bridge as the three-person science crew assembled at the primary viewport. Outside in the vacuum, {clean_details.lower()} cast long, eerie shadows across the docking ring.",
                "p2": f"Commander Chen barked coordinates, the systems engineer rerouted auxiliary power from life support, and the sensor specialist scrambled to calibrate the quantum receivers. In an environment where a single split-second oversight meant instantaneous decompression for all three, individual hesitation was a luxury none could afford. Every member of the trio knew their station and their duty.",
                "p3": f"\"All telemetry locked!\" the specialist called out as the final barrier clamped shut. The three stood shoulder-to-shoulder, their breath misting against the console glass as the data stream began to compile. Together, the crew had turned a catastrophic orbital breach into the discovery of a century."
            }
        },
        "Cyberpunk": {
            1: {
                "title": f"Ghost on Circuit 9: {first_clause[:30]}",
                "p1": f"Acid rain hissed against the synthetic collar of a worn trench coat as the solitary operative stepped into the shadows of Sector 4. Ahead in the flickering halogen glow, {clean_details.lower()} cut through the chemical haze like an unmasked glitch on an encrypted broadcast.",
                "p2": f"A single neural implant buzzed behind the right temple, feeding real-time biometric and surveillance feeds directly into the optical HUD. Working alone meant zero trust and zero witnesses—in a megacity where life was priced in disposable crypto credits, having no backup was both a death sentence and the only true guarantee of survival.",
                "p3": f"A gloved hand slid inside the coat, flicking the safety off the silenced slugthrower. Slipping past the security perimeter without leaving a digital footprint, the solitary operative vanished into the neon dark."
            },
            2: {
                "title": f"The Neon Handshake: {first_clause[:30]}",
                "p1": f"Under the stuttering pink glow of a dead holographic billboard, two shadowy figures met beneath the rusted steel catwalks. Rainwater dripped between them as both kept their optical lenses trained on {clean_details.lower()}.",
                "p2": f"\"Did you bring the decryption key?\" the netrunner muttered, cybernetic fingers tapping anxiously against a reinforced data slate. The street-samurai opposite didn't answer immediately; instead, a chrome-plated arm shifted slightly under the jacket, revealing a primed mantis blade. In this town, a partnership was only as reliable as the collateral held against it.",
                "p3": f"The handshake was brief, cold, and strictly transactional. The data slate switched hands, and without a second word, both slipped down opposite alleys into the neon-slick maze, their mutual secret intact for another night."
            },
            3: {
                "title": f"The Syndicate Breach: {first_clause[:30]}",
                "p1": f"Tucked behind an industrial exhaust chimney overlooking the megacorp plaza, the three-person crew finalized their perimeter sweep. In the courtyard below, {clean_details.lower()} was illuminated under the sweeping sweep of automated search drones.",
                "p2": f"\"Drones looping in ten seconds,\" the hacker whispered, eyes glowing electric blue in deep neural sync. Behind her, the heavy enforcer checked the battery clip on the electromagnetic disruptor, while the point scout signaled the clear route with sharp, silent hand gestures. It was a textbook heist crew: speed, muscle, and code moving as a single lethal organism.",
                "p3": f"\"Go now,\" came the command. The three broke cover simultaneously, dropping down the maintenance ladder in disciplined sync. Before the security grid could register the intrusion, the crew had already bypassed the gates."
            }
        },
        "Gothic Horror": {
            1: {
                "title": f"The Solitary Keeper: {first_clause[:30]}",
                "p1": f"The freezing Atlantic wind screamed through the fractures of the ancient stone masonry, dampening the rhythmic pounding of the breakers below. Alone in the drafty gallery, the solitary watcher stood motionless, watching {clean_details.lower()}.",
                "p2": f"The oil in the lantern was burning low, spitting blue sparks against the cracked chimney. In this forsaken promontory, isolation was not merely physical—it was an encroaching weight that pressed against the temples like a vice. Every creak of the floorboards behind seemed to mimic the cadence of footsteps that had ceased walking fifty years before.",
                "p3": f"Tightening the frayed wool coat against the chill, the lone keeper refused to turn around. Some horrors in this world thrived on acknowledgment; to survive the midnight watch, one had to stare into the dark and pretend the ghosts were only the wind."
            },
            2: {
                "title": f"The Bloodline Vigil: {first_clause[:30]}",
                "p1": f"A suffocating fog rolled across the moss-covered cemetery stones, enveloping two figures dressed in heavy mourning black. Between them, illuminated by a solitary candle flame, stood {clean_details.lower()}.",
                "p2": f"\"You should never have opened the vault, Father,\" the younger voice trembled, knuckles whitening around an iron crucifix. The elder man did not flinch, his hollow gaze fixed upon the shadowed stone threshold. They were the last two heirs of a family that had bargained away its peace two centuries ago, bound together by an ancient guilt they could neither confess nor escape.",
                "p3": f"A muffled thud resonated from beneath the damp earth. The two exchanged a look of pure, unadulterated terror—and then, with agonizing deliberate care, reached down together to slide the heavy iron bolts into place forever."
            },
            3: {
                "title": f"The Midnight Congregation: {first_clause[:30]}",
                "p1": f"The three villagers walked in a tight, protective triangle through the freezing mist, their iron lanterns casting swinging amber arcs against {clean_details.lower()}.",
                "p2": f"No one walked this road alone after the church bells struck twelve. The blacksmith carried the heavy woodcutter's axe on his shoulder; the apothecary held her herbs close to her chest; and the village elder led with the consecrated lantern. As the shadows stretched and warped between the barren elder trees, the trio pressed shoulder-to-shoulder, their synchronized footsteps the only defense against the silence.",
                "p3": f"\"Stay in the light,\" the elder commanded, raising the lantern high. As one united soul, the three crossed the threshold of the forgotten ground, their shared courage driving back the cold hungers of the night."
            }
        },
        "Noir Mystery": {
            1: {
                "title": f"Midnight on 4th Street: {first_clause[:30]}",
                "p1": f"Rain drummed a relentless rhythm against the brim of a dripping fedora as the private investigator stood alone in the doorway of a shuttered pawnshop. Across the glistening cobblestones, {clean_details.lower()} commanded the yellow glare of a lone streetlight.",
                "p2": f"A stale cigarette burned slowly between cold fingers. When you work solo in a city run by crooked judges and bought cops, paranoia isn't a flaw—it's your pension plan. The detective checked the snub-nosed revolver in the shoulder holster; the brass knuckles in the pocket were cold as ice, but the lead on the case was finally burning hot.",
                "p3": f"Taking one long, final drag of smoke, the investigator tossed the butt into the gutter and stepped into the downpour. The truth was ugly, but somebody had to collect the bill."
            },
            2: {
                "title": f"The Shakedown in the Alley: {first_clause[:30]}",
                "p1": f"Tucked behind the delivery dock of an abandoned meatpacking warehouse, two men stood face to face beneath an umbrella, both keeping their eyes pinned on {clean_details.lower()}.",
                "p2": f"\"You told me the district attorney wasn't looking at the bank accounts,\" the detective growled, pinning the informant against the wet brick wall. The informant gagged on the collar of his wet suit, gasping for breath: \"He wasn't! The feds stepped in this morning, I swear on my mother!\" In a corrupt city, two partners in crime were always just one plea bargain away from mutual destruction.",
                "p3": f"The detective loosened his grip with a disgusted scoff, shoving a damp envelope of hush money into the man's chest. \"Disappear on the 4:15 train,\" he said. \"If I see your face in this precinct again, you're on your own.\""
            },
            3: {
                "title": f"The Waterfront Syndicate: {first_clause[:30]}",
                "p1": f"The three men gathered beneath the rusted tin awning of Pier 14, their silhouettes silhouetted against the dark river while {clean_details.lower()} sat squarely on the wooden packing crate between them.",
                "p2": f"The boss tapped his gold ring on the lockbox; his lieutenant kept a hand on the trench coat lapel, scanning the fog for patrol cars; and the accountant hurriedly thumbed through the ledger with a pencil flashlight. It was a precision operation—a three-way division of criminal labor that had kept the syndicate ahead of the grand jury for ten straight years.",
                "p3": f"\"Count checks out,\" the accountant finally whispered. The boss snapped the latches shut with a crisp metallic click. All three men nodded in silent agreement, vanishing into the fog in three separate directions before the harbor police could round the bend."
            }
        },
        "High Fantasy": {
            1: {
                "title": f"The Solitary Oath: {first_clause[:30]}",
                "p1": f"Dawn spilled across the serrated peaks of the Dragon’s Teeth in ribbons of amber and rose. Standing high upon the wind-scoured ridge, a solitary wandering knight leaned upon a runic broadsword, looking down upon {clean_details.lower()}.",
                "p2": f"The mountain wind rustled the tattered heraldry of a kingdom that had fallen to ash a generation ago. Alone with the memories of fallen comrades and an unbroken vow sworn before the High King, the lone warrior needed neither army nor glory. A warrior who has lost everything has only their honor left to defend.",
                "p3": f"With a calm, steady breath, the blade was sheathed into its leather scabbard. Walking down the winding mountain goat path toward destiny, the solitary wanderer did not look back."
            },
            2: {
                "title": f"The Oath of Two Shields: {first_clause[:30]}",
                "p1": f"Beneath the ancient, moss-draped branches of the Whispering Forest, two battle-weary companions rested against an elven waystone, gazing together toward {clean_details.lower()}.",
                "p2": f"The ranger unstrung her yew bow with practiced grace while the dwarven vanguard checked the edge of his battleaxe with a thumb. \"They'll be tracking the river by nightfall,\" the dwarf grunted, passing a skin of honeyed mead across the embers. \"Then we make our stand at the bridge,\" she replied, her eyes meeting his with the quiet fire of brothers-in-arms who had survived seven bloody sieges side by side.",
                "p3": f"Clashing their bracers together in the ancient ritual of the frontier, the two companions stood tall. Two shields, united under one purpose, were enough to hold any pass in the realm."
            },
            3: {
                "title": f"The Fellowship of the Stone: {first_clause[:30]}",
                "p1": f"The three companions stood gathered around the ancient altar table in the ruined abbey, their cloaks drawn against the swirling highland snow as they inspected {clean_details.lower()}.",
                "p2": f"The wizard traced the glowing blue ley lines on the stone with the tip of his staff; the paladin kept his shield raised toward the shadowed archway; and the young scout watched the snowy treeline with an arrow notched to the string. Each brought a distinct strength to the fellowship—arcane lore, sacred resilience, and wilderness mastery intertwined in sacred unity.",
                "p3": f"\"The seal is breaking,\" the wizard announced as the runes flared with blinding silver brilliance. The three warriors locked eyes, nodding in unbroken resolve. Together as one fellowship, they stepped forward into the breach."
            }
        },
        "Dystopian": {
            1: {
                "title": f"The Lone Drifter: {first_clause[:30]}",
                "p1": f"A suffocating wind blew across the fractured asphalt of Interstate 80, kicking up clouds of alkaline dust and sun-scorched rust. Walking alone through the graveyard of dead automobiles, a solitary scavenger paused, fixing a cracked pair of goggles on {clean_details.lower()}.",
                "p2": f"The Geiger counter at the hip chattered with an erratic, low-frequency hum. Water was down to three swallows in the military canteen, and every breath through the respirator smelled of sulfur and decayed rubber. But out here in the ruins of the Old World, traveling alone was the only reason the drifter was still breathing—no mouths to feed, no back to guard, and no shared rations.",
                "p3": f"Shouldering the scavenged rifle, the solitary survivor adjusted the solar battery pack and continued north toward the mountain line. In the wasteland, tomorrow was a prize you had to earn mile by mile."
            },
            2: {
                "title": f"Two in the Wasteland: {first_clause[:30]}",
                "p1": f"Perched on the crumbling roof of a sun-baked gas station, two scavengers scanned the shimmering heat waves across {clean_details.lower()}.",
                "p2": f"\"Dust cloud moving fast from the south,\" the spotter warned, lowering her cracked binoculars. Her partner, seasoned by twenty winters of post-collapse survival, checked the bolt of his scavenged hunting rifle with calm precision. In a world stripped of law and civilization, having one person you could trust with your life while you slept was the rarest currency on earth.",
                "p3": f"\"Pack the water tins and take the rear trail,\" he instructed, clapping her shoulder. \"We stick together and we don't look back.\" Moving in coordinated sync, the two survivors slipped down the drainage pipe and vanished into the dunes."
            },
            3: {
                "title": f"The Outpost Guard: {first_clause[:30]}",
                "p1": f"Behind a barricade of rusted shipping containers and sandbags, the three-person settlement guard watched the dust storm roll across {clean_details.lower()}.",
                "p2": f"The lookout racked the spotlight switch; the gunner manned the heavy machine gun mount; and the squad medic distributed fresh potassium iodide tablets. In this harsh frontier, survival wasn't an individual sport—it was an ironclad community contract where every member held the line for the other two.",
                "p3": f"\"Storm's hitting the perimeter!\" the lookout shouted over the howling gale. Standing shoulder-to-shoulder behind the iron plating, the trio raised their weapons and held their ground as the desert closed in around them."
            }
        }
    }

    selected_genre_data = genre_library.get(genre, genre_library["Sci-Fi"])
    # Fallback to 1 if count not in genre data
    selected_story = selected_genre_data.get(people_count, selected_genre_data[1])

    story_body = (
        f"### Act I: The Visual Awakening ({current_cast['tag']})\n\n"
        f"{selected_story['p1']}\n\n"
        f"### Act II: The Tension & Dynamic\n\n"
        f"{selected_story['p2']}\n\n"
        f"### Act III: The Resonant Resolution\n\n"
        f"{selected_story['p3']}"
    )

    return {
        "success": True,
        "title": selected_story["title"],
        "genre": genre,
        "people_count": people_count,
        "cast_type": current_cast["label"],
        "cast_badge": f"{current_cast['icon']} {current_cast['tag']} ({current_cast['label']})",
        "story": story_body,
        "provider": "PRISM Computer Vision & Narrative Engine"
    }
