import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface PriceChartProps {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
}

export default function PriceChart({ selectedPeriod, setSelectedPeriod }: PriceChartProps) {
  const generateData = (period: string) => {
    const now = new Date();
    const data = [];
    let timeIncrement, dataPoints;

    switch (period) {
      case "1H":
        timeIncrement = 60 * 1000; // 1 minute
        dataPoints = 60;
        break;
      case "1D":
        timeIncrement = 60 * 60 * 1000; // 1 hour
        dataPoints = 24;
        break;
      case "1W":
        timeIncrement = 24 * 60 * 60 * 1000; // 1 day
        dataPoints = 7;
        break;
      case "∞":
        timeIncrement = 7 * 24 * 60 * 60 * 1000; // 1 week
        dataPoints = 52;
        break;
      default:
        timeIncrement = 60 * 1000;
        dataPoints = 60;
    }

    for (let i = dataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * timeIncrement);
      const value = Math.random() * 1000 + 1000; // Random value between 1000 and 2000
      data.push({
        time: time,
        y: value,
        label: formatLabel(time, period),
      });
    }

    return data;
  };

  const formatLabel = (date: Date, period: string) => {
    switch (period) {
      case "1H":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "1D":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "1W":
        return date.toLocaleDateString([], { weekday: 'short' });
      case "∞":
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const data = generateData(selectedPeriod);

  return (
    <>
      <div className="h-96 w-[90%] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="y"
              stroke="#11b4d8cc"
              strokeWidth={2}
              dot={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#ffffff", fontSize: 12, opacity: 0.6 }}
              interval={selectedPeriod === "1H" || selectedPeriod === "1D" ? 5 : selectedPeriod === "∞" ? 19 : "preserveStartEnd"}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide={true} domain={["auto", "auto"]} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-2 mt-4">
        {["1H", "1D", "1W", "∞"].map((period) => (
          <button
            key={period}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedPeriod === period ? "bg-[#11b4d8] text-white" : "bg-gray-800"
            }`}
            onClick={() => setSelectedPeriod(period)}
          >
            {period}
          </button>
        ))}
      </div>
    </>
  );
}