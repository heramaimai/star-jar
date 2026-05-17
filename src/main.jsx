import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bath,
  Bed,
  BookOpen,
  Camera,
  ChevronDown,
  Coffee,
  Copy,
  Download,
  Droplets,
  DoorOpen,
  Ear,
  Feather,
  Heart,
  Home,
  ImagePlus,
  Leaf,
  Mail,
  Moon,
  Music,
  PenLine,
  Plus,
  Save,
  Share2,
  Shirt,
  Smile,
  Sparkles,
  Star,
  Sun,
  UserCheck,
  UserRound,
  Users,
  Waves,
  X,
} from "lucide-react";
import { playSound } from "./utils/sound";
import { supabase } from "./lib/supabase";
import "./styles.css";

const iconMap = {
  sun: Sun,
  bed: Bed,
  bowl: Leaf,
  water: Droplets,
  shirt: Shirt,
  door: DoorOpen,
  music: Music,
  chat: Users,
  heart: Heart,
  tear: Droplets,
  moon: Moon,
  bath: Bath,
  book: BookOpen,
  pen: PenLine,
  coffee: Coffee,
  therapy: Ear,
  feather: Feather,
  smile: Smile,
  waves: Waves,
  star: Star,
};

const iconChoices = [
  ["sun", "太阳"],
  ["bed", "床"],
  ["bowl", "叶子"],
  ["water", "水杯"],
  ["shirt", "衣服"],
  ["door", "门"],
  ["music", "音乐"],
  ["chat", "聊天"],
  ["heart", "心"],
  ["tear", "眼泪"],
  ["moon", "月亮"],
  ["bath", "热水"],
  ["book", "书"],
  ["pen", "写字"],
  ["coffee", "咖啡"],
  ["therapy", "倾听"],
];

const jarMeta = [
  { id: "survival", name: "生存罐", color: "#d9c27a" },
  { id: "body", name: "身体罐", color: "#8f9f72" },
  { id: "emotion", name: "情绪罐", color: "#b98272" },
  { id: "relation", name: "关系罐", color: "#9a8fbd" },
  { id: "joy", name: "微小快乐罐", color: "#d4a848" },
  { id: "therapy", name: "心理咨询罐", color: "#78909a" },
];

const starterActions = [
  ["睁开眼睛", "你醒来了，这已经是一件事。", "survival", "sun", "我今天睁开眼睛了。"],
  ["起床", "你离开了床，哪怕只是一会儿。", "survival", "bed", "我今天起床了。"],
  ["吃东西", "身体被照顾到了一点点。", "body", "bowl", "我吃了东西。"],
  ["喝水", "谢谢你没有忘记自己。", "body", "water", "我喝了一杯水。"],
  ["换干净衣服", "你值得舒服一点。", "body", "shirt", "我换了干净衣服。"],
  ["走出门", "外面的世界，今天见到你了。", "survival", "door", "我走出门了。"],
  ["晒太阳", "光落在你身上了。", "joy", "sun", "我晒到了太阳。"],
  ["听音乐", "有人替你表达了情绪。", "emotion", "music", "我听了音乐。"],
  ["和朋友聊天", "你没有完全一个人待着。", "relation", "chat", "我和朋友聊了天。"],
  ["接受关心", "你允许别人靠近了一点。", "relation", "heart", "我接受了一点关心。"],
  ["哭泣", "眼泪也是一种代谢。", "emotion", "tear", "我允许自己哭泣。"],
  ["发呆", "暂停不是浪费时间。", "emotion", "moon", "我发了一会儿呆。"],
  ["洗热水澡", "热水也会抱抱你。", "body", "bath", "我洗了热水澡。"],
  ["和小动物在一起", "它不知道你怎么了，但它陪着你。", "joy", "heart", "我和小动物待了一会儿。"],
  ["看书", "你短暂离开了痛苦。", "joy", "book", "我看了一点书。"],
  ["写字", "你留下了自己的痕迹。", "emotion", "pen", "我写下了一些字。"],
  ["冥想", "慢一点，也没关系。", "body", "waves", "我慢慢呼吸了一会儿。"],
  ["喝咖啡", "这一刻稍微暖了一点。", "joy", "coffee", "我喝了一杯咖啡。"],
  ["心理咨询", "你正在认真地理解自己。", "therapy", "therapy", "我完成了今天的心理咨询。"],
  ["今天什么都没做", "有时候，活下来就已经用尽全力了。", "survival", "moon", "我允许自己什么都没做。"],
].map(([title, text, jar, icon, record], index) => ({
  id: `care-${index}`,
  title,
  text,
  jar,
  icon,
  record,
}));

const seedEntries = [
  { jar: "survival", title: "起床", text: "我今天起床了。", icon: "bed" },
  { jar: "body", title: "喝水", text: "我喝了一杯水。", icon: "water" },
  { jar: "survival", title: "今天什么都没做", text: "我允许自己什么都没做。", icon: "moon" },
  { jar: "therapy", title: "心理咨询", text: "今天咨询里，我发现自己已经撑了很久。", icon: "therapy" },
];

const gentleCards = ["你很重要", "休息一下，不用马上回来也没关系", "你已经做得很好了", "谢谢你爱自己", "我收下了"];

const soundPresets = [
  { id: "star-drop", name: "冰块声" },
  { id: "doubadou", name: "豆巴豆" },
  { id: "horn", name: "小喇叭" },
  { id: "magic", name: "魔法音" },
  { id: "sheep", name: "羊叫" },
  { id: "fart", name: "噗噗声" },
  { id: "mute", name: "静音" },
];;

const moods = [
  ["低落", "moon"],
  ["麻木", "feather"],
  ["焦虑", "waves"],
  ["平静", "leaf"],
  ["稍微好一点", "sun"],
];

const tips = [
  "把今天缩小到下一分钟：先喝一口水，或者把脚放到地面上。",
  "如果做不到完整洗澡，可以只洗脸、擦手、换一件舒服的衣服。",
  "给自己一个低要求版本：不是完成任务，只是让身体少难受一点。",
  "难过时可以给可信任的人发一句：我现在有点难，需要你陪我一会儿。",
  "记录不是为了证明进步，只是给未来的自己留一点线索。",
];

const specimenFeedbacks = [
  "这也是你照顾自己的证据。",
  "这一点光，被好好留下来了。",
  "你看见了它，也看见了自己。",
  "这不是小事。",
  "今天的你，也有认真活着。",
  "它会替你记得这个瞬间。",
];

const therapistReplies = [
  "我在听。你可以慢慢说，不用一次讲清楚。",
  "听起来这件事对你很重要。我们先把它轻轻放在这里。",
  "谢谢你愿意说出来。今天能说到这里，已经很好了。",
  "如果现在很累，可以先停一停。你不需要马上变好。",
  "我会陪你把这句话收好。它不需要被别人理解，先被你看见就可以。",
];

const todayKey = () => new Date().toISOString().slice(0, 10);

const offsetDateKey = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const seedSpecimens = [
  {
    id: "specimen-sun",
    name: "今天的阳光",
    jar: "body",
    date: todayKey(),
    image: null,
    placeholder: "sun",
    feedback: "这一点光，被好好留下来了。",
  },
  {
    id: "specimen-water",
    name: "这杯热水",
    jar: "survival",
    date: todayKey(),
    image: null,
    placeholder: "water",
    feedback: "这也是你照顾自己的证据。",
  },
  {
    id: "specimen-cat",
    name: "猫陪我待了一会儿",
    jar: "relation",
    date: offsetDateKey(-1),
    image: null,
    placeholder: "cat",
    feedback: "它会替你记得这个瞬间。",
  },
];

function App() {
  const [activeTab, setActiveTabState] = useState(() => {
    const tab = window.location.hash.replace("#", "");
    return ["home", "records", "diary", "discover", "me"].includes(tab) ? tab : "home";
  });
  const [night, setNight] = useState(false);
  const [actions, setActions] = useState(starterActions);
  const [entries, setEntries] = useState(seedEntries);
  const [records, setRecords] = useState(seedEntries.map((entry) => entry.text));
  const [feedback, setFeedback] = useState(null);
  const [ceremony, setCeremony] = useState(null);
  const [openJar, setOpenJar] = useState("survival");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("低落");
  const [diary, setDiary] = useState("");
  const [diaries, setDiaries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [soundPreset, setSoundPreset] = useState("star-drop");
  const playSelectedDropSound = () => {
    if (soundPreset === "mute") return;
  
    playSound(soundPreset, {
      volume: 0.4,
      restart: true,
    });
  };
  const [specimens, setSpecimens] = useState(seedSpecimens);
  const [pendingSpecimen, setPendingSpecimen] = useState(null);
  const [specimenName, setSpecimenName] = useState("");
  const [specimenJar, setSpecimenJar] = useState("joy");
  const [selectedSpecimenDate, setSelectedSpecimenDate] = useState(todayKey());
  const [fallingSpecimen, setFallingSpecimen] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [therapist, setTherapist] = useState({
    hair: "bun",
    face: "soft",
    eyes: "smile",
    accessory: "glasses",
    outfit: "sage",
  });

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  const specimenEntries = useMemo(
    () =>
      specimens.map((specimen) => ({
        jar: specimen.jar,
        title: specimen.name,
        text: `我把『${specimen.name}』收进了光的标本室。`,
        icon: "star",
      })),
    [specimens],
  );

  const jarItems = useMemo(() => [...entries, ...specimenEntries], [entries, specimenEntries]);

  const jarCounts = useMemo(() => {
    const counts = Object.fromEntries(jarMeta.map((jar) => [jar.id, 0]));
    jarItems.forEach((entry) => {
      counts[entry.jar] += 1;
    });
    return counts;
  }, [jarItems]);

  const totalStars = useMemo(() => jarItems.length, [jarItems]);

  const pickGentleCard = (action) => {
    return {
      actionTitle: action.title,
      line: gentleCards[Math.floor(Math.random() * gentleCards.length)],
    };
  };

  const playDropSound = () => {
    if (soundPreset === "mute") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = soundPreset === "duck" || soundPreset === "sheep" ? 0.28 : 0.36;
    master.connect(ctx.destination);

    const makePing = (frequency, start, duration, volume, type = "sine", q = 18) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, start);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.93, start + duration);
      filter.type = "bandpass";
      filter.frequency.value = frequency;
      filter.Q.value = q;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    };

    const playNoise = (start, length, frequency, volume) => {
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * length, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        const decay = Math.pow(1 - i / data.length, 2.4);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();
      noise.buffer = noiseBuffer;
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = frequency;
      noiseFilter.Q.value = 2.8;
      noiseGain.gain.setValueAtTime(volume, now + start);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + start + length + 0.03);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start(now + start);
      noise.stop(now + start + length + 0.04);
    };

    if (soundPreset === "ice") {
      makePing(3280, now, 0.42, 0.15);
      makePing(4680, now + 0.018, 0.3, 0.085);
      makePing(2520, now + 0.075, 0.34, 0.09);
      makePing(3920, now + 0.14, 0.24, 0.06);
      makePing(1760, now + 0.22, 0.46, 0.045);
      playNoise(0.01, 0.045, 5200, 0.032);
      return;
    }

    if (soundPreset === "duck") {
      makePing(520, now, 0.11, 0.16, "square", 5);
      makePing(390, now + 0.1, 0.12, 0.13, "square", 4);
      makePing(560, now + 0.24, 0.1, 0.1, "square", 5);
      playNoise(0.01, 0.035, 1300, 0.03);
      return;
    }

    if (soundPreset === "marble") {
      makePing(2260, now, 0.22, 0.14, "triangle", 13);
      makePing(3150, now + 0.06, 0.18, 0.09, "triangle", 14);
      makePing(1840, now + 0.16, 0.18, 0.075, "sine", 10);
      playNoise(0.02, 0.065, 3600, 0.045);
      return;
    }

    if (soundPreset === "sheep") {
      makePing(360, now, 0.34, 0.13, "sawtooth", 3);
      makePing(430, now + 0.08, 0.42, 0.1, "sawtooth", 3);
      makePing(300, now + 0.21, 0.36, 0.08, "triangle", 3);
      playNoise(0.03, 0.12, 720, 0.025);
    }
  };

  const collectAction = (action) => {
    setCeremony({ action, phase: "arrive", key: Date.now() });
    window.setTimeout(() => setCeremony((current) => current && { ...current, phase: "open" }), 620);
    window.setTimeout(() => setCeremony((current) => current && { ...current, phase: "drop" }), 1420);
    window.setTimeout(() => {
      playSelectedDropSound();
      setEntries((current) => [
        { jar: action.jar, title: action.title, text: action.record, icon: action.icon },
        ...current,
      ]);
      setRecords((current) => [action.record, ...current].slice(0, 10));
      setFeedback(pickGentleCard(action));
      setOpenJar(action.jar);
    }, 2520);
    window.setTimeout(() => setCeremony(null), 3500);
    window.setTimeout(() => setFeedback(null), 7600);
  };

  const saveTherapyNote = () => {
    const clean = note.trim();
    collectAction({
      title: "咨询里的话",
      text: "记录一句今天想带走的话",
      jar: "therapy",
      icon: "therapy",
      record: clean ? `今天咨询里，我想记住：“${clean}”` : "今天咨询里，我给自己留了一点位置。",
    });
    setNote("");
  };

  const saveMood = () => {
    if (!diary.trim()) return;
    setDiaries((current) => [{ mood, text: diary.trim(), time: "今天" }, ...current]);
    setDiary("");
  };

  const upsertAction = (draft) => {
    if (!draft.title.trim()) return;
    const payload = {
      ...draft,
      text: draft.text.trim() || "这件小事也值得被收起来。",
      record: draft.record.trim() || `我今天做了：${draft.title.trim()}。`,
    };
    setActions((current) =>
      payload.id
        ? current.map((item) => (item.id === payload.id ? payload : item))
        : [{ ...payload, id: `care-${Date.now()}` }, ...current],
    );
    setEditing(null);
  };

  const openSpecimenModal = (file) => {
    if (!file) return;
    const image = URL.createObjectURL(file);
    setPendingSpecimen({ image });
    setSpecimenName("");
    setSpecimenJar("joy");
  };

  const saveSpecimen = () => {
    if (!pendingSpecimen) return;
    const cleanName = specimenName.trim() || "未命名的一点光";
    const feedback = specimenFeedbacks[Math.floor(Math.random() * specimenFeedbacks.length)];
    const specimen = {
      id: `specimen-${Date.now()}`,
      name: cleanName,
      jar: specimenJar,
      date: todayKey(),
      image: pendingSpecimen.image,
      placeholder: null,
      feedback,
    };
    setSpecimens((current) => [specimen, ...current]);
    setRecords((current) => [`我把『${cleanName}』收进了光的标本室。`, ...current].slice(0, 10));
    setSelectedSpecimenDate(specimen.date);
    setFallingSpecimen({ ...specimen, phase: "falling" });
    setFeedback({ line: "这点光，已经被收好了。" });
    setPendingSpecimen(null);
    setSpecimenName("");
    window.setTimeout(() => setFallingSpecimen((current) => current && { ...current, phase: "landed" }), 1250);
    window.setTimeout(() => setFallingSpecimen(null), 1850);
    window.setTimeout(() => setFeedback(null), 4200);
  };

  return (
    <main className={night ? "app page-night" : "app"}>
      <div className="paper-grain" />
      <JarCeremony ceremony={ceremony} />
      {feedback && <GentleFeedback feedback={feedback} onClose={() => setFeedback(null)} />}

      {activeTab === "home" && (
        <HomePage
          actions={actions}
          jarCounts={jarCounts}
          entries={jarItems}
          night={night}
          setNight={setNight}
          collectAction={collectAction}
          openJar={openJar}
          setOpenJar={setOpenJar}
          therapist={therapist}
          note={note}
          setNote={setNote}
          saveTherapyNote={saveTherapyNote}
          records={records}
          setActiveTab={setActiveTab}
          onOpenMenu={() => setMenuOpen(true)}
          soundPreset={soundPreset}
          setSoundPreset={setSoundPreset}
          playSelectedDropSound={playSelectedDropSound}
        />
      )}

      {activeTab === "records" && (
        <RecordsPage actions={actions} editing={editing} setEditing={setEditing} upsertAction={upsertAction} />
      )}

      {activeTab === "diary" && (
        <DiaryPage mood={mood} setMood={setMood} diary={diary} setDiary={setDiary} diaries={diaries} saveMood={saveMood} />
      )}

      {activeTab === "discover" && (
        <SpecimenRoomPage
          specimens={specimens}
          pendingSpecimen={pendingSpecimen}
          specimenName={specimenName}
          setSpecimenName={setSpecimenName}
          specimenJar={specimenJar}
          setSpecimenJar={setSpecimenJar}
          selectedDate={selectedSpecimenDate}
          setSelectedDate={setSelectedSpecimenDate}
          openSpecimenModal={openSpecimenModal}
          saveSpecimen={saveSpecimen}
          closeModal={() => setPendingSpecimen(null)}
          fallingSpecimen={fallingSpecimen}
        />
      )}

      {activeTab === "me" && (
        <MePage
          totalStars={totalStars}
          jarCounts={jarCounts}
          therapist={therapist}
          setTherapist={setTherapist}
        />
      )}

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        setUser={setUser}
        specimens={specimens}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}

function HomePage(props) {
  const {
    actions,
    jarCounts,
    entries,
    night,
    setNight,
    collectAction,
    openJar,
    setOpenJar,
    therapist,
    note,
    setNote,
    saveTherapyNote,
    records,
    setActiveTab,
    onOpenMenu,
    soundPreset,
    setSoundPreset,
    playSelectedDropSound,
  } = props;

  return (
    <>
      <section className="hero-scene" id="care">
        <button className="menu-dot" aria-label="菜单" onClick={onOpenMenu}>
          <span />
          <span />
          <span />
        </button>
        <button className="moon-dot" onClick={() => setNight(!night)} aria-label="切换夜晚模式">
          {night ? <Sun size={25} /> : <Moon size={25} />}
        </button>
        <div className="hero-copy">
          <h1>星 星 罐 <Star size={26} fill="#d6a849" /></h1>
          <p>{night ? "这些星星不是成就，是你今天没有放弃自己的证据。" : "谢谢你，今天也没有放弃自己"}</p>
          <div className="hero-affirmation">
            <span>就算今天什么也没做，</span>
            <span>你也值得拥有一颗星星</span>
          </div>
        </div>
        <div className="room-illustration pixel-scene" aria-hidden="true">
          <div className="pixel-window">
            <span />
            <span />
            <span />
          </div>
          <div className="pixel-hanging-star" />
          <div className="pixel-plant">
            <span />
            <span />
            <span />
          </div>
          <div className="pixel-table" />
          <div className="pixel-big-jar">
            <i />
            <b />
            <span />
            <span />
            <span />
          </div>
          <div className="pixel-spark one" />
          <div className="pixel-spark two" />
          <div className="pixel-spark three" />
        </div>
      </section>

      <PaperPanel
        title="今天想为自己做的小事"
        action={<button className="text-link" onClick={() => setActiveTab("records")}>管理</button>}
      >
        <SoundPicker value={soundPreset} onChange={setSoundPreset} onTest={playSelectedDropSound} />
        <div className="care-grid watercolor-grid">
          {actions.slice(0, 20).map((action) => (
            <CareCard key={action.id} action={action} onClick={() => collectAction(action)} />
          ))}
        </div>
        <div className="pager-dots"><span /><span /><span /><span /></div>
      </PaperPanel>

      <PaperPanel title="我的星星罐" action={<span>点开查看</span>}>
        <div className="wood-shelf">
          {jarMeta.map((jar) => (
            <StarJar
              key={jar.id}
              jar={jar}
              count={jarCounts[jar.id]}
              open={openJar === jar.id}
              entries={entries.filter((entry) => entry.jar === jar.id)}
              onToggle={() => setOpenJar(openJar === jar.id ? "" : jar.id)}
            />
          ))}
        </div>
      </PaperPanel>

      <section className="dashboard-row">
        <TherapistCard therapist={therapist} note={note} setNote={setNote} onSave={saveTherapyNote} />
        <PaperPanel title="今日记录" action={<button className="text-link" onClick={() => setActiveTab("diary")}>全部</button>}>
          <div className="record-list compact">
            {records.slice(0, 4).map((record, index) => (
              <p key={`${record}-${index}`}>「{record}」</p>
            ))}
          </div>
        </PaperPanel>
        <PaperPanel
          title="夜晚模式"
          action={<button className={night ? "switch on" : "switch"} onClick={() => setNight(!night)} aria-label="切换夜晚模式" />}
        >
          <div className="night-preview">
            <Moon size={30} fill="#f1d37b" />
            <p>这些星星不是成就，是你今天没有放弃自己的证据。</p>
            <button className="olive-button" onClick={() => setNight(!night)}>{night ? "切换到白天" : "切换到夜晚"}</button>
          </div>
        </PaperPanel>
      </section>
    </>
  );
}

function SoundPicker({ value, onChange, onTest }) {
  return (
    <div className="sound-picker">
      <span>落罐声音</span>
      <div>
        {soundPresets.map((preset) => (
          <button
            className={value === preset.id ? "chosen" : ""}
            key={preset.id}
            onClick={() => onChange(preset.id)}
          >
            {preset.name}
          </button>
        ))}
      </div>
      <button className="sound-test" onClick={onTest}>试听</button>
    </div>
  );
}

function CareCard({ action, onClick }) {
  const Icon = iconMap[action.icon] || Star;
  return (
    <button className="care-card" onClick={onClick}>
      <span className="icon-drawing">
        <Icon size={34} strokeWidth={1.45} />
      </span>
      <strong>{action.title}</strong>
      <small>{action.text}</small>
    </button>
  );
}

function StarJar({ jar, count, open, entries, onToggle }) {
  const level = Math.floor(count / 30);
  const stars = Array.from({ length: Math.min(count, 18) }, (_, index) => ({
    left: 18 + ((index * 19) % 58),
    top: 38 + ((index * 17) % 38),
    size: 13 + (index % 4) * 3,
  }));

  return (
    <article className={open ? "jar-accordion open" : "jar-accordion"}>
      <button className="jar-button" onClick={onToggle} style={{ "--jar-color": jar.color }}>
        <div className={level > 0 ? "glass-jar upgraded" : "glass-jar"}>
          <span className="cork-lid" />
          <span className="jar-mouth" />
          <div className="jar-body">
            {stars.map((star, index) => (
              <span
                className="textured-star"
                key={index}
                style={{ left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }}
              />
            ))}
          </div>
        </div>
        <span className="jar-tag">{jar.name}<small>{count}</small></span>
        <ChevronDown className="chev" size={16} />
      </button>
      <div className="jar-content">
        {entries.length === 0 ? (
          <p>这里还空着，空着也没关系。</p>
        ) : (
          entries.slice(0, 5).map((entry, index) => {
            const Icon = iconMap[entry.icon] || Star;
            return (
              <div className="jar-entry" key={`${entry.text}-${index}`}>
                <Icon size={18} />
                <span>{entry.title}</span>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}

function MenuDrawer({ open, onClose, user, setUser, specimens }) {
  const [email, setEmail] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(specimens[0]?.id || "");
  const [shareStatus, setShareStatus] = useState("");
  const [cardUrl, setCardUrl] = useState("");
  const selectedSpecimen = specimens.find((specimen) => specimen.id === selectedId) || specimens[0];
  const shareText = selectedSpecimen
    ? `我把『${selectedSpecimen.name}』收进了星星罐的光的标本室。${formatDateLabel(selectedSpecimen.date)}，这一点光被好好留下来了。`
    : "我在星星罐里收起了一点今天的光。";

  const sendCode = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLoginStatus("先写下邮箱，我再把验证码送过去。");
      return;
    }
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: cleanEmail });
    setAuthLoading(false);
    if (error) {
      setLoginStatus(error.message || "验证码没有发送成功，请再试一次。");
      return;
    }
    setOtpSent(true);
    setLoginStatus("验证码已发送到你的邮箱。");
  };

  const completeLogin = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim();
    const cleanToken = codeInput.trim();
    if (!otpSent) {
      setLoginStatus("请先获取验证码。");
      return;
    }
    if (!cleanToken) {
      setLoginStatus("请输入邮箱收到的 8 位验证码");
      return;
    }
    setAuthLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: "email",
    });
    setAuthLoading(false);
    if (error) {
      setLoginStatus(error.message);
      return;
    }
    setUser(data.user || null);
    setCodeInput("");
    setOtpSent(false);
    setLoginStatus("已经登录好了。");
  };

  const signOut = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signOut();
    setAuthLoading(false);
    if (error) {
      setLoginStatus(error.message || "退出登录失败，请再试一次。");
      return;
    }
    setUser(null);
    setLoginStatus("已经退出登录。");
  };

  const createCardBlob = async () => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = 360 * scale;
    canvas.height = 500 * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.fillStyle = "#fff7df";
    ctx.fillRect(0, 0, 360, 500);
    ctx.strokeStyle = "rgba(126, 103, 70, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 360; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 500);
      ctx.stroke();
    }
    for (let y = 0; y <= 500; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(360, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#6e5b42";
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 324, 464);
    ctx.fillStyle = "#33291f";
    ctx.font = "bold 24px Microsoft YaHei, sans-serif";
    ctx.fillText("星星罐 · 光的标本", 42, 64);
    ctx.font = "14px Microsoft YaHei, sans-serif";
    ctx.fillStyle = "#7a684e";
    ctx.fillText(selectedSpecimen ? formatDateLabel(selectedSpecimen.date) : todayKey(), 42, 92);

    ctx.save();
    ctx.beginPath();
    drawRoundRect(ctx, 76, 118, 208, 208, 28);
    ctx.clip();
    ctx.fillStyle = "#f5ecd7";
    ctx.fillRect(76, 118, 208, 208);
    if (selectedSpecimen?.image) {
      await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          const ratio = Math.min(208 / image.width, 208 / image.height);
          const width = image.width * ratio;
          const height = image.height * ratio;
          ctx.drawImage(image, 76 + (208 - width) / 2, 118 + (208 - height) / 2, width, height);
          resolve();
        };
        image.onerror = resolve;
        image.src = selectedSpecimen.image;
      });
    } else {
      const gradient = ctx.createLinearGradient(76, 118, 284, 326);
      gradient.addColorStop(0, "#f7d876");
      gradient.addColorStop(1, "#d6ece8");
      ctx.fillStyle = gradient;
      ctx.fillRect(76, 118, 208, 208);
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    drawRoundRect(ctx, 76, 118, 208, 208, 28);
    ctx.stroke();

    ctx.fillStyle = "#33291f";
    ctx.font = "bold 22px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(selectedSpecimen?.name || "未命名的一点光", 180, 370);
    ctx.font = "15px Microsoft YaHei, sans-serif";
    ctx.fillStyle = "#6f8055";
    ctx.fillText(selectedSpecimen ? getJarName(selectedSpecimen.jar) : "星星罐", 180, 398);
    ctx.font = "14px Microsoft YaHei, sans-serif";
    ctx.fillStyle = "#7a684e";
    wrapCanvasText(ctx, selectedSpecimen?.feedback || "这一点光，被好好留下来了。", 180, 432, 250, 24);

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
  };

  const showGeneratedCard = (blob) => {
    const url = URL.createObjectURL(blob);
    setCardUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return url;
    });
    return url;
  };

  const downloadCard = async () => {
    setShareStatus("正在生成标本卡片……");
    try {
      const blob = await createCardBlob();
      if (!blob) {
        setShareStatus("卡片暂时没有生成成功，请再试一次。");
        return;
      }
      const url = showGeneratedCard(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedSpecimen?.name || "星星罐标本"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShareStatus("卡片已生成。手机上如果没有自动下载，可以点下面图片打开后长按保存。");
    } catch {
      setShareStatus("卡片暂时没有生成成功，请再试一次。");
    }
  };

  const shareCard = async () => {
    setShareStatus("");
    try {
      const blob = await createCardBlob();
      if (blob) showGeneratedCard(blob);
      const file = blob ? new File([blob], `${selectedSpecimen?.name || "星星罐标本"}.png`, { type: "image/png" }) : null;
      if (navigator.share && file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "星星罐里的光", text: shareText, files: [file] });
        setShareStatus("分享面板已打开。");
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "星星罐里的光", text: shareText });
        setShareStatus("分享面板已打开。");
        return;
      }
      await navigator.clipboard?.writeText(shareText);
      setShareStatus("已复制分享文案，也可以先下载卡片再发给朋友。");
    } catch {
      setShareStatus("分享没有完成，也没关系。可以下载卡片后再发给朋友。");
    }
  };

  if (!open) return null;

  return (
    <div className="menu-backdrop">
      <aside className="menu-drawer" aria-label="菜单栏">
        <button className="menu-close" onClick={onClose} aria-label="关闭菜单"><X size={18} /></button>
        <header>
          <span className="menu-mini-icon"><i /><i /><i /></span>
          <div>
            <h2>星星罐菜单</h2>
            <p>登录后，可以把自己的光做成一张小卡片，留给自己，也可以发给朋友。</p>
          </div>
        </header>

        <section className="menu-section">
          <h3>用户登录</h3>
          {user ? (
            <div className="login-state">
              <UserCheck size={18} />
              <span>已用邮箱登录</span>
              <strong>{user.email}</strong>
              <button onClick={signOut} disabled={authLoading}>{authLoading ? "退出中" : "退出登录"}</button>
            </div>
          ) : (
            <div className="code-login">
              <form className="email-login" onSubmit={sendCode}>
                <Mail size={17} />
                <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="输入邮箱" type="email" />
                <button type="submit" disabled={authLoading}>{authLoading ? "发送中" : "获取验证码"}</button>
              </form>
              {otpSent && (
                <form className="verify-login" onSubmit={completeLogin}>
                  <input
                    value={codeInput}
                    onChange={(event) => setCodeInput(event.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="请输入邮箱收到的 8 位验证码"
                    inputMode="numeric"
                    maxLength={8}
                  />
                  <button type="submit" disabled={authLoading}>{authLoading ? "登录中" : "登录"}</button>
                </form>
              )}
              {loginStatus && <p className="share-status">{loginStatus}</p>}
            </div>
          )}
        </section>

        <section className="menu-section">
          <h3>生成我的标本卡片</h3>
          <select value={selectedSpecimen?.id || ""} onChange={(event) => setSelectedId(event.target.value)}>
            {specimens.map((specimen) => (
              <option key={specimen.id} value={specimen.id}>{specimen.name}</option>
            ))}
          </select>
          <div className="specimen-export-card">
            {selectedSpecimen && <SpecimenSticker specimen={selectedSpecimen} />}
            <strong>{selectedSpecimen?.name || "未命名的一点光"}</strong>
            <span>{selectedSpecimen ? formatDateLabel(selectedSpecimen.date) : todayKey()}</span>
            <small>{selectedSpecimen ? getJarName(selectedSpecimen.jar) : "星星罐"}</small>
            <p>{selectedSpecimen?.feedback || "这一点光，被好好留下来了。"}</p>
          </div>
          <div className="share-actions">
            <button onClick={downloadCard}><Download size={16} />下载卡片</button>
            <button onClick={shareCard}><Share2 size={16} />转发朋友</button>
            <button onClick={() => navigator.clipboard?.writeText(shareText).then(() => setShareStatus("已复制分享文案。"))}>
              <Copy size={16} />复制
            </button>
          </div>
          {cardUrl && (
            <a className="generated-card-preview" href={cardUrl} download={`${selectedSpecimen?.name || "星星罐标本"}.png`} target="_blank" rel="noreferrer">
              <img src={cardUrl} alt="已生成的标本卡片" />
              <span>点开查看，手机上可长按保存</span>
            </a>
          )}
          {shareStatus && <p className="share-status">{shareStatus}</p>}
        </section>
      </aside>
    </div>
  );
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = [...text];
  let line = "";
  words.forEach((word) => {
    const testLine = line + word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
      return;
    }
    line = testLine;
  });
  if (line) ctx.fillText(line, x, y);
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function TherapistCard({ therapist, note, setNote, onSave }) {
  const [chatText, setChatText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: "therapist", text: "今天想跟我说点什么吗？一句话也可以。" },
  ]);

  const sendChat = async (event) => {
    event.preventDefault();
    const cleanText = chatText.trim();
    if (!cleanText || chatLoading) return;
    const userMessage = { from: "user", text: cleanText };
    const nextMessages = [
      ...chatMessages,
      userMessage,
    ].slice(-8);
    setChatMessages(nextMessages);
    setChatText("");
    setChatLoading(true);

    try {
      const response = await fetch(getChatApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanText, messages: chatMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "chat failed");
      setChatMessages((current) => [
        ...current,
        { from: "therapist", text: data.reply || fallbackTherapistReply() },
      ].slice(-8));
    } catch {
      setChatMessages((current) => [
        ...current,
        { from: "therapist", text: fallbackTherapistReply() },
      ].slice(-8));
    } finally {
      setChatLoading(false);
    }
  };

  const fallbackTherapistReply = () => therapistReplies[Math.floor(Math.random() * therapistReplies.length)];

  const getChatApiUrl = () => {
    const { protocol, hostname } = window.location;
    const isLocalHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(hostname);
    const isLanHost = /^(10|172\.(1[6-9]|2\d|3[0-1])|192\.168)\./.test(hostname);
    if (!isLocalHost && !isLanHost) return "/api/chat";
    return `${protocol}//${hostname}:8787/api/chat`;
  };

  return (
    <PaperPanel title="我的咨询师" action={<span>可在“我的”捏脸</span>}>
      <div className="therapist-card">
        <div className="therapist-avatar-wrap">
          <TherapistAvatar config={therapist} />
          <span className="voice-hint">戳我可以听见我的声音哦</span>
        </div>
        <div className="therapist-copy">
          <strong>今天见到的咨询师</strong>
          <p>记录一句今天想带走的话</p>
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="写下一句今天想记住的话……" />
          <button className="olive-button" onClick={onSave}>收进心理咨询罐</button>
          <div className="therapist-chat" aria-label="和咨询师对话">
            <div className="chat-bubbles">
              {chatMessages.map((message, index) => (
                <p className={message.from === "user" ? "from-user" : "from-therapist"} key={`${message.from}-${index}`}>
                  {message.text}
                </p>
              ))}
              {chatLoading && <p className="from-therapist thinking">我在听……</p>}
            </div>
            <form className="chat-input-row" onSubmit={sendChat}>
              <input
                value={chatText}
                onChange={(event) => setChatText(event.target.value)}
                placeholder="想说什么都可以……"
              />
              <button type="submit" disabled={chatLoading}>{chatLoading ? "等待" : "发送"}</button>
            </form>
          </div>
        </div>
      </div>
    </PaperPanel>
  );
}

function TherapistAvatar({ config }) {
  const handleVoice = () => {
    playSound("therapist-voice", { volume: 0.35 });
  };

  return (
    <div
      className={`avatar outfit-${config.outfit} face-${config.face} eyes-${config.eyes} accessory-${config.accessory}`}
      role="button"
      tabIndex={0}
      aria-label="播放咨询师语音"
      onClick={handleVoice}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleVoice();
        }
      }}
    >
      <span className={`avatar-hair hair-${config.hair}`} />
      <span className="avatar-neck" />
      <span className="avatar-face">
        <i className="eye left" />
        <i className="eye right" />
        <i className="mouth" />
        <i className="blush left" />
        <i className="blush right" />
      </span>
      <span className="avatar-body" />
      <span className="avatar-accessory" />
    </div>
  );
}

function RecordsPage({ actions, editing, setEditing, upsertAction }) {
  const emptyDraft = { title: "", text: "", record: "", jar: "survival", icon: "sun" };
  const draft = editing || emptyDraft;
  const update = (patch) => setEditing({ ...draft, ...patch });

  return (
    <PageShell title="记录页" subtitle="增加或修改主页里的小事，也可以换成更适合你的图标。">
      <div className="editor-panel">
        <div className="form-grid">
          <input value={draft.title} onChange={(event) => update({ title: event.target.value })} placeholder="小事名称" />
          <select value={draft.jar} onChange={(event) => update({ jar: event.target.value })}>
            {jarMeta.map((jar) => <option key={jar.id} value={jar.id}>{jar.name}</option>)}
          </select>
          <textarea value={draft.text} onChange={(event) => update({ text: event.target.value })} placeholder="卡片上的温柔文案" />
          <textarea value={draft.record} onChange={(event) => update({ record: event.target.value })} placeholder="完成后进入今日记录的句子" />
        </div>
        <div className="icon-picker">
          {iconChoices.map(([id, label]) => {
            const Icon = iconMap[id];
            return (
              <button className={draft.icon === id ? "chosen" : ""} key={id} onClick={() => update({ icon: id })}>
                <Icon size={22} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
        <div className="button-row">
          <button className="olive-button" onClick={() => upsertAction(draft)}><Save size={17} />保存到主页</button>
          <button className="ghost-button" onClick={() => setEditing(emptyDraft)}><Plus size={17} />新增一项</button>
        </div>
      </div>
      <div className="manage-list">
        {actions.map((action) => {
          const Icon = iconMap[action.icon] || Star;
          return (
            <button key={action.id} onClick={() => setEditing(action)}>
              <Icon size={24} />
              <span><strong>{action.title}</strong><small>{action.text}</small></span>
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}

function DiaryPage({ mood, setMood, diary, setDiary, diaries, saveMood }) {
  return (
    <PageShell title="日记页" subtitle="选择一个最接近今天的情绪，再把想说的话放进对话框里。">
      <div className="mood-picker">
        {moods.map(([label, icon]) => {
          const Icon = iconMap[icon] || Smile;
          return (
            <button className={mood === label ? "chosen" : ""} key={label} onClick={() => setMood(label)}>
              <Icon size={30} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="diary-box">
        <textarea value={diary} onChange={(event) => setDiary(event.target.value)} placeholder="今天发生了什么？你不用讲清楚，碎碎念也可以。" />
        <button className="olive-button" onClick={saveMood}>保存今天的心情</button>
      </div>
      <div className="diary-list">
        {diaries.map((item, index) => (
          <article key={`${item.text}-${index}`}>
            <strong>{item.time} · {item.mood}</strong>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function SpecimenRoomPage({
  specimens,
  pendingSpecimen,
  specimenName,
  setSpecimenName,
  specimenJar,
  setSpecimenJar,
  selectedDate,
  setSelectedDate,
  openSpecimenModal,
  saveSpecimen,
  closeModal,
  fallingSpecimen,
}) {
  const selectedSpecimens = specimens.filter((specimen) => specimen.date === selectedDate);

  return (
    <PageShell
      className="specimen-room"
      title="光的标本室"
      subtitle="世界不是灰的，因为有了这些光，今天和昨天便有了区别，一切也都有了意义"
    >
      <section className="specimen-hero-card">
        <div>
          <span className="specimen-kicker">私人情绪影像收藏馆</span>
          <h2>拍下这一刻</h2>
          <p>拍下今天让你为之停留的一瞬间。</p>
        </div>
        <div className="specimen-actions">
          <label>
            <Camera size={17} />
            拍照
            <input type="file" accept="image/*" capture="environment" onChange={(event) => openSpecimenModal(event.target.files?.[0])} />
          </label>
          <label>
            <ImagePlus size={17} />
            从相册选择
            <input type="file" accept="image/*" onChange={(event) => openSpecimenModal(event.target.files?.[0])} />
          </label>
        </div>
      </section>

      <section className="specimen-layout">
        <PaperPanel title="本月留下的光" action={<span>手帐日历</span>}>
          <SpecimenCalendar specimens={specimens} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          <div className="day-specimens">
            {selectedSpecimens.length === 0 ? (
              <p>
                今天还没有留下标本。
                <br />
                一束光、一杯水、一只猫、一片云，都可以。
              </p>
            ) : (
              selectedSpecimens.map((specimen) => (
                <div className="day-specimen-row" key={specimen.id}>
                  <SpecimenSticker specimen={specimen} small />
                  <span>{specimen.name}</span>
                  <small>{getJarName(specimen.jar)}</small>
                </div>
              ))
            )}
          </div>
        </PaperPanel>

        <PaperPanel title="我的光" action={<span>{specimens.length} 枚标本</span>}>
          <div className="specimen-wall">
            {specimens.map((specimen) => (
              <article className="specimen-card" key={specimen.id}>
                <SpecimenSticker specimen={specimen} />
                <div>
                  <h3>{specimen.name}</h3>
                  <p>{getJarName(specimen.jar)} · {formatDateLabel(specimen.date)}</p>
                  <small>{specimen.feedback}</small>
                </div>
              </article>
            ))}
          </div>
        </PaperPanel>
      </section>

      {pendingSpecimen && (
        <SpecimenModal
          pendingSpecimen={pendingSpecimen}
          specimenName={specimenName}
          setSpecimenName={setSpecimenName}
          specimenJar={specimenJar}
          setSpecimenJar={setSpecimenJar}
          saveSpecimen={saveSpecimen}
          closeModal={closeModal}
        />
      )}

      {fallingSpecimen && (
        <div className={fallingSpecimen.phase === "landed" ? "falling-specimen landed" : "falling-specimen"}>
          <SpecimenSticker specimen={fallingSpecimen} />
        </div>
      )}
    </PageShell>
  );
}

function SpecimenModal({ pendingSpecimen, specimenName, setSpecimenName, specimenJar, setSpecimenJar, saveSpecimen, closeModal }) {
  return (
    <div className="specimen-modal-backdrop">
      <div className="specimen-modal">
        <button className="modal-close" onClick={closeModal} aria-label="关闭">×</button>
        <h2>给这一刻起个名字</h2>
        <div className="specimen-preview">
          <img src={pendingSpecimen.image} alt="上传照片预览" />
        </div>
        <input
          value={specimenName}
          onChange={(event) => setSpecimenName(event.target.value)}
          placeholder="比如：今天的太阳照到我了"
        />
        <div className="jar-choice-grid">
          {jarMeta.map((jar) => (
            <button
              className={specimenJar === jar.id ? "chosen" : ""}
              key={jar.id}
              onClick={() => setSpecimenJar(jar.id)}
              style={{ "--jar-color": jar.color }}
            >
              <span />
              {jar.name}
            </button>
          ))}
        </div>
        <button className="olive-button specimen-save" onClick={saveSpecimen}>收进标本室</button>
      </div>
    </div>
  );
}

function SpecimenCalendar({ specimens, selectedDate, setSelectedDate }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: startDay }, (_, index) => ({ empty: true, id: `empty-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { day, date, specimens: specimens.filter((specimen) => specimen.date === date) };
    }),
  ];

  return (
    <div className="specimen-calendar">
      <div className="calendar-title">{year} 年 {month + 1} 月</div>
      <div className="calendar-weekdays">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => <span key={day}>周{day}</span>)}
      </div>
      <div className="calendar-grid">
        {cells.map((cell) =>
          cell.empty ? (
            <span className="calendar-day empty" key={cell.id} />
          ) : (
            <button
              className={[
                "calendar-day",
                cell.date === selectedDate ? "selected" : "",
                cell.date === todayKey() ? "today" : "",
              ].join(" ")}
              key={cell.date}
              onClick={() => setSelectedDate(cell.date)}
            >
              <strong>{cell.day}</strong>
              {cell.specimens[0] && <SpecimenSticker specimen={cell.specimens[0]} tiny />}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function SpecimenSticker({ specimen, small = false, tiny = false }) {
  const className = ["specimen-sticker", small ? "small" : "", tiny ? "tiny" : ""].join(" ");
  return (
    <span className={className}>
      {specimen.image ? (
        <img src={specimen.image} alt={specimen.name} />
      ) : (
        <span className={`specimen-placeholder ${specimen.placeholder || "sun"}`} />
      )}
    </span>
  );
}

function getJarName(jarId) {
  return jarMeta.find((jar) => jar.id === jarId)?.name || "星星罐";
}

function formatDateLabel(date) {
  if (date === todayKey()) return "今天";
  if (date === offsetDateKey(-1)) return "昨天";
  return date.slice(5).replace("-", " 月 ") + " 日";
}

function MePage({ totalStars, jarCounts, therapist, setTherapist }) {
  const update = (key, value) => setTherapist((current) => ({ ...current, [key]: value }));
  return (
    <PageShell title="我的" subtitle="看看你收集过的光，也可以把咨询师形象调整得更像你愿意靠近的人。">
      <div className="me-grid">
        <PaperPanel title="星星统计" action={<span>{totalStars} 颗</span>}>
          <div className="level-list">
            {jarMeta.map((jar) => {
              const count = jarCounts[jar.id];
              const left = 30 - (count % 30 || 30);
              return (
                <div key={jar.id}>
                  <span>{jar.name}</span>
                  <strong>{count} / {(Math.floor(count / 30) + 1) * 30}</strong>
                  <i><b style={{ width: `${Math.min(100, (count % 30) / 30 * 100)}%` }} /></i>
                  <small>{count >= 30 ? "已升级，可以继续收集下一阶。" : `还差 ${left} 颗升级。`}</small>
                </div>
              );
            })}
          </div>
        </PaperPanel>
        <PaperPanel title="咨询师形象" action={<span>捏脸</span>}>
          <div className="customizer">
            <TherapistAvatar config={therapist} />
            <OptionRow label="发型" value={therapist.hair} options={["bun", "short", "long"]} names={["低丸子", "短发", "长卷发"]} onChange={(v) => update("hair", v)} />
            <OptionRow label="脸型" value={therapist.face} options={["soft", "round", "oval"]} names={["柔和", "圆脸", "鹅蛋脸"]} onChange={(v) => update("face", v)} />
            <OptionRow label="五官" value={therapist.eyes} options={["smile", "calm", "warm"]} names={["微笑", "平静", "温暖"]} onChange={(v) => update("eyes", v)} />
            <OptionRow label="配饰" value={therapist.accessory} options={["glasses", "earring", "scarf"]} names={["眼镜", "耳饰", "围巾"]} onChange={(v) => update("accessory", v)} />
            <OptionRow label="衣服" value={therapist.outfit} options={["sage", "cream", "mauve"]} names={["鼠尾草绿", "奶油毛衣", "浅紫外套"]} onChange={(v) => update("outfit", v)} />
          </div>
        </PaperPanel>
      </div>
    </PageShell>
  );
}

function OptionRow({ label, value, options, names, onChange }) {
  return (
    <div className="option-row">
      <span>{label}</span>
      <div>
        {options.map((option, index) => (
          <button className={value === option ? "chosen" : ""} key={option} onClick={() => onChange(option)}>
            {names[index]}
          </button>
        ))}
      </div>
    </div>
  );
}

function JarCeremony({ ceremony }) {
  if (!ceremony) return null;
  const jar = jarMeta.find((item) => item.id === ceremony.action.jar) || jarMeta[0];
  const Icon = iconMap[ceremony.action.icon] || Star;
  return (
    <div className={`ceremony phase-${ceremony.phase}`}>
      <div className="ceremony-card" style={{ "--jar-color": jar.color }}>
        <p>{ceremony.action.title}</p>
        <div className="ceremony-jar">
          <span className="cork-lid" />
          <span className="jar-mouth" />
          <div className="jar-body">
            <span className="textured-star waiting" />
          </div>
        </div>
        <span className="falling-token"><Icon size={30} /></span>
        <span className="falling-star"><Star size={40} fill="#f4cf63" /></span>
      </div>
    </div>
  );
}

function GentleFeedback({ feedback, onClose }) {
  return (
    <div className="gentle-card-backdrop">
      <div className="gentle-card" role="status">
        <p>{feedback.line}</p>
        <button onClick={onClose}>嗯</button>
      </div>
    </div>
  );
}

function PaperPanel({ title, action, children }) {
  return (
    <section className="paper-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PageShell({ title, subtitle, children, className = "" }) {
  return (
    <section className={["page-shell", className].filter(Boolean).join(" ")}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
    </section>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    ["home", "首页", Home],
    ["records", "记录", BookOpen],
    ["diary", "日记", PenLine],
    ["discover", "标本室", SproutIcon],
    ["me", "我的", UserRound],
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map(([id, label, Icon]) => (
        <button className={activeTab === id ? "active" : ""} key={id} onClick={() => setActiveTab(id)}>
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function SproutIcon(props) {
  return <Leaf {...props} />;
}

createRoot(document.getElementById("root")).render(<App />);
