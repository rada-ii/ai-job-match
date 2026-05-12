export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-block px-4 py-1 mb-6 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full uppercase tracking-wide">
          🚧 In active development
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          AI Job Match
        </h1>

        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          AI-enhanced job matching platform powered by Claude. Get personalized
          job rankings with reasoning and auto-generated cover letters.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {[
            "Next.js 16",
            "TypeScript",
            "Claude API",
            "PostgreSQL",
            "Prisma",
            "Python",
            "Tailwind",
          ].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 shadow-sm border border-slate-200"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Coming soon
          </h2>
          <ul className="text-left space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span>Database schema & seed data</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <span>Claude API integration</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-slate-300 font-bold">○</span>
              <span>Profile form & job matching</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-slate-300 font-bold">○</span>
              <span>AI cover letter generator</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-slate-300 font-bold">○</span>
              <span>Contextual chat assistant</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Built by{" "}
          <a
            href="https://github.com/rada-ii"
            className="text-blue-600 hover:underline font-medium"
          >
            Rada Ivanković
          </a>
        </p>
      </div>
    </main>
  );
}
