FROM node:21-slim

# Install system dependencies
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

# Setup the startup script
COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Disable Next.js telemetry for cleaner sandbox logs
ENV NEXT_TELEMETRY_DISABLED=1

# Setup directory structure
WORKDIR /home/user/nextjs-app

# Initialize Next.js and Shadcn
# Note: We accept defaults to avoid interactive prompts
RUN npx --yes create-next-app@latest . --yes --eslint --typescript --no-src-dir --import-alias "@/*"
RUN npx --yes shadcn@latest init --yes -b neutral --force
RUN npx --yes shadcn add --all --yes

# Move app to root user dir (flattening structure)
WORKDIR /home/user
RUN cp -r nextjs-app/* . && cp -r nextjs-app/.* . 2>/dev/null || true && rm -rf nextjs-app

# Expose the Next.js port
EXPOSE 3000

